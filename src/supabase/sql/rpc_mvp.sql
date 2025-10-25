-- get_feed(user) → listings tailored to contract/preferences (placeholder)
create or replace function public.get_feed(p_user_id uuid)
returns setof public.listings
language sql
security definer
as $$
  select l.*
  from public.listings l
  where l.status = 'active'
  order by l.created_at desc
  limit 50;
$$;

-- user_like_listing(listing) → returns { match_id }
create or replace function public.user_like_listing(p_listing_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
  v_match uuid;
  v_owner uuid;
begin
  insert into public.likes (user_id, listing_id, direction)
  values (v_user, p_listing_id, 'like')
  on conflict (user_id, listing_id) do update set direction = excluded.direction;

  select owner_id into v_owner from public.listings where id = p_listing_id;

  -- naive: immediately open chat; replace with mutual logic later
  insert into public.matches (nurse_user_id, owner_user_id, listing_id, status)
  values (v_user, v_owner, p_listing_id, 'chat')
  on conflict do nothing
  returning id into v_match;

  return json_build_object('match_id', v_match);
end;
$$;

-- create_listing(input json) → returns new id
create or replace function public.create_listing(p_input json)
returns json
language plpgsql
security definer
as $$
declare
  v_owner uuid := auth.uid();
  v_id uuid;
begin
  insert into public.listings (
    owner_id, title, weekly_price, min_stay_weeks, pet_rules, safety, description, thumb_url, video_url
  ) values (
    v_owner,
    (p_input->>'title')::text,
    (p_input->>'weekly_price')::int,
    coalesce((p_input->>'min_stay_weeks')::int, 4),
    (p_input->'pet_rules')::jsonb,
    (p_input->'safety')::jsonb,
    (p_input->>'description')::text,
    (p_input->>'thumb_url')::text,
    (p_input->>'video_url')::text
  )
  returning id into v_id;

  return json_build_object('id', v_id);
end;
$$;
