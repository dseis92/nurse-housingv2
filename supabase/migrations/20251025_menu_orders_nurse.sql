-- === Buckets ===
insert into storage.buckets (id, name, public)
select 'listing-images','listing-images', true
where not exists (select 1 from storage.buckets where id='listing-images');

drop policy if exists "Public read listing-images"   on storage.objects;
drop policy if exists "Staff upload listing-images"  on storage.objects;
drop policy if exists "Staff update listing-images"  on storage.objects;
drop policy if exists "Staff delete listing-images"  on storage.objects;

create policy "Public read listing-images"
on storage.objects for select
to public
using (bucket_id = 'listing-images');

create policy "Staff upload listing-images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'listing-images');

create policy "Staff update listing-images"
on storage.objects for update
to authenticated
using (bucket_id = 'listing-images');

create policy "Staff delete listing-images"
on storage.objects for delete
to authenticated
using (bucket_id = 'listing-images');

-- === Tables ===

create extension if not exists pgcrypto;

-- Listings (renamed from menu_items)
create table if not exists public.listings (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  title          text not null,
  description    text,
  nightly_rate   numeric(10,2) not null check (nightly_rate >= 0),
  category       text,
  tags           text[],
  hero_image_url text,
  is_active      boolean not null default true,
  occupancy      int,
  sort_order     int,
  host_id        uuid references auth.users(id)
);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_listings_updated on public.listings;
create trigger trg_listings_updated
before update on public.listings
for each row execute function public.touch_updated_at();

-- Bookings (renamed from orders)
create table if not exists public.bookings (
  id             text primary key,
  listing_id     uuid references public.listings(id),
  guest_id       uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  check_in       date not null,
  check_out      date not null,
  guests_adults  int not null default 1,
  guests_children int not null default 0,
  subtotal       numeric(10,2) not null,
  discount       numeric(10,2) not null default 0,
  tax            numeric(10,2) not null default 0,
  service_fee    numeric(10,2) not null default 0,
  tip            numeric(10,2) not null default 0,
  total          numeric(10,2) not null,
  coupon         text,
  stage          text not null default 'new' check (stage in ('new','approved','checked_in','checked_out','cancelled')),
  payment_mode   text not null default 'card' check (payment_mode in ('card','invoice','cash')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','refunded')),
  notes          text
);

-- Booking line items (nightly charges, fees)
create table if not exists public.booking_line_items (
  id        bigserial primary key,
  booking_id text not null references public.bookings(id) on delete cascade,
  item_type text not null, -- e.g. 'nightly', 'cleaning_fee'
  description text,
  amount    numeric(10,2) not null
);

-- Nurse profiles
create table if not exists public.nurse_profiles (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  answers   jsonb not null default '{}'::jsonb,
  onboarded boolean not null default false,
  xp_points int not null default 0,
  badges    text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Onboarding payload
create table if not exists public.nurse_onboarding (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  payload   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- === Indexes ===
create index if not exists idx_bookings_created on public.bookings (created_at desc);
create index if not exists idx_bookings_listing on public.bookings (listing_id);
create index if not exists idx_listing_active_sort on public.listings (is_active, sort_order asc nulls last, title asc);

-- === RLS ===
alter table public.listings enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_line_items enable row level security;
alter table public.nurse_profiles enable row level security;
alter table public.nurse_onboarding enable row level security;

-- Listings: public read, hosts manage their own
drop policy if exists "public read listings" on public.listings;
create policy "public read listings" on public.listings
for select using (is_active = true);

drop policy if exists "host insert listings" on public.listings;
create policy "host insert listings" on public.listings
for insert to authenticated
with check (host_id = auth.uid());

drop policy if exists "host update listings" on public.listings;
create policy "host update listings" on public.listings
for update to authenticated
using (host_id = auth.uid())
with check (host_id = auth.uid());

drop policy if exists "host delete listings" on public.listings;
create policy "host delete listings" on public.listings
for delete to authenticated
using (host_id = auth.uid());

-- Bookings: guest sees/create own, host/admin read
drop policy if exists "guest insert bookings" on public.bookings;
create policy "guest insert bookings" on public.bookings
for insert to authenticated
with check (guest_id = auth.uid());

drop policy if exists "guest read bookings" on public.bookings;
create policy "guest read bookings" on public.bookings
for select to authenticated
using (guest_id = auth.uid() or
       exists (select 1 from public.listings l where l.id = listing_id and l.host_id = auth.uid()));

drop policy if exists "admin update bookings" on public.bookings;
create policy "admin update bookings" on public.bookings
for update to authenticated
using (auth.role() = 'service_role' or auth.uid() = guest_id);

-- Booking line items follow booking policy
drop policy if exists "line items access" on public.booking_line_items;
create policy "line items access" on public.booking_line_items
for all to authenticated
using (exists (select 1 from public.bookings b where b.id = booking_id and
              (b.guest_id = auth.uid() or exists (select 1 from public.listings l where l.id = b.listing_id and l.host_id = auth.uid()))))
with check (exists (select 1 from public.bookings b where b.id = booking_id and b.guest_id = auth.uid()));

-- Nurse profile policies
drop policy if exists "nurse_profiles select self" on public.nurse_profiles;
create policy "nurse_profiles select self" on public.nurse_profiles
for select to authenticated using (user_id = auth.uid());

drop policy if exists "nurse_profiles upsert self" on public.nurse_profiles;
create policy "nurse_profiles upsert self" on public.nurse_profiles
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Nurse onboarding policies
drop policy if exists "nurse_onboarding select self" on public.nurse_onboarding;
create policy "nurse_onboarding select self" on public.nurse_onboarding
for select to authenticated using (user_id = auth.uid());

drop policy if exists "nurse_onboarding upsert self" on public.nurse_onboarding;
create policy "nurse_onboarding upsert self" on public.nurse_onboarding
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- === RPCs ===
create or replace function public.upsert_nurse_onboarding(p_input jsonb)
returns void
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.nurse_onboarding (user_id, payload, updated_at)
  values (v_user, coalesce(p_input, '{}'::jsonb), now())
  on conflict (user_id) do update
    set payload = coalesce(excluded.payload, '{}'::jsonb),
        updated_at = now();

  -- mirror onto nurse_profiles and mark onboarded
  insert into public.nurse_profiles (user_id, answers, onboarded, updated_at)
  values (v_user, coalesce(p_input, '{}'::jsonb), true, now())
  on conflict (user_id) do update
    set answers   = coalesce(excluded.answers, '{}'::jsonb),
        onboarded = true,
        updated_at = now();
end;
$$;

create or replace function public.get_nurse_onboarding()
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  return (
    select coalesce(payload, '{}'::jsonb)
    from public.nurse_onboarding
    where user_id = v_user
  );
end;
$$;

-- === Realtime publication ===
do $$
begin
  begin
    alter publication supabase_realtime add table public.bookings;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.booking_line_items;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.listings;
  exception when duplicate_object then null;
  end;
end $$;
