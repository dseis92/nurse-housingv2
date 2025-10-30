-- Retry deployment of next-steps features after earlier partial run.
-- Contains idempotent versions of owner likes, scoring feed, and hold RPCs.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Mutual matching: owner_likes + RPCs
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.owner_likes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  nurse_user_id uuid not null references public.profiles(id) on delete cascade,
  decision text not null check (decision in ('like','pass')),
  created_at timestamptz default now(),
  unique (owner_user_id, listing_id, nurse_user_id)
);
alter table public.owner_likes enable row level security;
drop policy if exists "owner_likes:rw:self" on public.owner_likes;
create policy "owner_likes:rw:self" on public.owner_likes
for all to authenticated
using (owner_user_id = (select auth.uid()))
with check (owner_user_id = (select auth.uid()));

-- Nurse likes listing → only match if owner already liked the nurse for this listing
create or replace function public.user_like_listing(p_listing_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_user   uuid := (select auth.uid());
  v_match  uuid;
  v_owner  uuid;
  v_exists boolean;
begin
  insert into public.likes (user_id, listing_id, direction)
  values (v_user, p_listing_id, 'like')
  on conflict (user_id, listing_id) do update set direction = excluded.direction;

  select owner_id into v_owner from public.listings where id = p_listing_id;

  select exists(
    select 1 from public.owner_likes
    where listing_id = p_listing_id and nurse_user_id = v_user and decision = 'like'
  ) into v_exists;

  if v_exists then
    insert into public.matches (nurse_user_id, owner_user_id, listing_id, status)
    values (v_user, v_owner, p_listing_id, 'chat')
    on conflict do nothing
    returning id into v_match;
  end if;

  return json_build_object('match_id', v_match);
end;
$$;

-- Owner likes a specific nurse for a listing (pre-approve or like-back)
create or replace function public.owner_like_listing(p_listing_id uuid, p_nurse_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_owner uuid := (select auth.uid());
  v_match uuid;
  v_nurse_liked boolean;
begin
  insert into public.owner_likes (owner_user_id, listing_id, nurse_user_id, decision)
  values (v_owner, p_listing_id, p_nurse_user_id, 'like')
  on conflict (owner_user_id, listing_id, nurse_user_id) do update set decision = 'like';

  select exists(
    select 1 from public.likes
    where user_id = p_nurse_user_id and listing_id = p_listing_id and direction = 'like'
  ) into v_nurse_liked;

  if v_nurse_liked then
    insert into public.matches (nurse_user_id, owner_user_id, listing_id, status)
    values (p_nurse_user_id, v_owner, p_listing_id, 'chat')
    on conflict do nothing
    returning id into v_match;
  end if;

  return json_build_object('match_id', v_match);
end;
$$;

grant execute on function public.user_like_listing(uuid)        to authenticated;
grant execute on function public.owner_like_listing(uuid, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Scoring: score_listings() and get_feed() using scores
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.score_listings(p_user_id uuid)
returns table(listing_id uuid, score numeric)
language plpgsql
security definer
as $$
declare
  v_stipend int := 1500;
  v_length  int := 13;
begin
  select weekly_stipend, length_weeks
  into v_stipend, v_length
  from public.contracts
  where nurse_user_id = p_user_id
  order by created_at desc
  limit 1;

  return query
  with base as (
    select l.id,
           l.weekly_price,
           (l.safety->>'smart_locks')::bool as smart_locks,
           (l.safety->>'cameras_entry')::bool as cameras_entry,
           (l.safety->>'safe_parking')::bool as safe_parking
    from public.listings l
    where l.status = 'active'
  ),
  fit as (
    select id,
      greatest(0.0, 1.0 - greatest(0.0, (weekly_price - v_stipend)::numeric / nullif(v_stipend,0))) as fit_score
    from base
  ),
  safety as (
    select id,
      ((case when smart_locks then 0.35 else 0 end)
      + (case when cameras_entry then 0.30 else 0 end)
      + (case when safe_parking then 0.35 else 0 end)) as safety_score
    from base
  ),
  quality as (
    select id, 0.70::numeric as quality_score
    from base
  )
  select b.id as listing_id,
         round( (0.5*(f.fit_score) + 0.3*(s.safety_score) + 0.2*(q.quality_score))::numeric, 4 ) as score
  from base b
  join fit f using (id)
  join safety s using (id)
  join quality q using (id);
end;
$$;

create or replace function public.get_feed(p_user_id uuid)
returns setof public.listings
language sql
security definer
as $$
  with sc as (
    select * from public.score_listings(p_user_id)
  )
  select l.*
  from public.listings l
  left join sc on sc.listing_id = l.id
  where l.status = 'active'
  order by sc.score desc nulls last, l.created_at desc
  limit 50;
$$;

grant execute on function public.score_listings(uuid) to authenticated;
grant execute on function public.get_feed(uuid)       to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Soft Holds: RPCs + expiry
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.holds (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  intent_fee_cents int not null default 2000,
  status text not null default 'pending' check (status in ('pending','active','expired','released')),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  client_secret text,
  created_at timestamptz default now()
);
alter table public.holds enable row level security;
drop policy if exists "holds:participants" on public.holds;
drop policy if exists "holds:insert:participants" on public.holds;
create policy "holds:participants" on public.holds
for select to authenticated
using (
  exists(
    select 1 from public.matches m
    where m.id = holds.match_id and (select auth.uid()) in (m.nurse_user_id, m.owner_user_id)
  )
);
create policy "holds:insert:participants" on public.holds
for insert to authenticated
with check (
  exists(
    select 1 from public.matches m
    where m.id = holds.match_id and (select auth.uid()) in (m.nurse_user_id, m.owner_user_id)
  )
);

create or replace function public.create_hold(
  p_match_id uuid,
  p_amount_cents int default 2000,
  p_start_date date default null,
  p_end_date date default null
)
returns json
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  insert into public.holds (match_id, intent_fee_cents, status, expires_at, start_date, end_date)
  values (p_match_id, p_amount_cents, 'pending', now() + interval '24 hours', p_start_date, p_end_date)
  returning id into v_id;

  return json_build_object('hold_id', v_id);
end;
$$;

create or replace function public.expire_holds()
returns json
language sql
security definer
as $$
  with upd as (
    update public.holds
    set status = 'expired'
    where status in ('pending','active')
      and expires_at < now()
    returning id
  )
  select json_build_object('expired', count(*)) from upd;
$$;

grant execute on function public.create_hold(uuid, int, date, date) to authenticated;
grant execute on function public.expire_holds()       to authenticated;
