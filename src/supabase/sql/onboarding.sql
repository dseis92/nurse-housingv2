-- === PROFILES & NURSE TABLES ===
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('nurse','owner','admin')) default null,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role);

create table if not exists public.nurses_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  safety jsonb not null default '{}'::jsonb,    -- {female_only, verified_host_only, ...}
  commute jsonb not null default '{}'::jsonb,   -- {max_minutes, avoid_tolls, ...}
  preferences jsonb not null default '{}'::jsonb, -- {pets, parking, budget_weekly, ...}
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hospital text,
  unit text,
  shift_type text,             -- e.g. nights, days
  start_date date,
  length_weeks int,
  stipend_weekly int,
  pet_status text,             -- has_pet / none
  parking_needs text,
  created_at timestamptz not null default now()
);
create index if not exists contracts_user_idx on public.contracts(user_id);

-- === TRIGGER: ensure profile on auth.user ===
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- === RLS ===
alter table public.profiles enable row level security;
alter table public.nurses_profiles enable row level security;
alter table public.contracts enable row level security;

drop policy if exists "profiles_self_rw" on public.profiles;
create policy "profiles_self_rw" on public.profiles
  for select using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "nurses_self_rw" on public.nurses_profiles;
create policy "nurses_self_rw" on public.nurses_profiles
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "contracts_self_rw" on public.contracts;
create policy "contracts_self_rw" on public.contracts
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin convenience (optional): allow admins to see all
drop policy if exists "profiles_admin_ro" on public.profiles;
create policy "profiles_admin_ro" on public.profiles
  for select using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "nurses_admin_ro" on public.nurses_profiles;
create policy "nurses_admin_ro" on public.nurses_profiles
  for select using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "contracts_admin_ro" on public.contracts;
create policy "contracts_admin_ro" on public.contracts
  for select using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- === RPC: upsert nurse onboarding in one call ===
create or replace function public.upsert_nurse_onboarding(
  p_profile jsonb,   -- {full_name?, phone?}
  p_prefs   jsonb,   -- preferences json (budget_weekly, pets, parking,...)
  p_safety  jsonb,   -- safety json (female_only, verified_host_only, locks,...)
  p_commute jsonb,   -- commute json (max_minutes, avoid_bridges, avoid_tolls, overnight_parking)
  p_contract jsonb   -- {hospital, unit, shift_type, start_date, length_weeks, stipend_weekly, pet_status, parking_needs}
) returns json language plpgsql security definer as $$
declare
  v_uid uuid := auth.uid();
  v_contract_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  -- ensure profile row exists & set role to nurse if empty
  insert into public.profiles (id, role, full_name, phone)
  values (v_uid, 'nurse', coalesce(p_profile->>'full_name', null), coalesce(p_profile->>'phone', null))
  on conflict (id) do update
  set role = coalesce(public.profiles.role, 'nurse'),
      full_name = coalesce(p_profile->>'full_name', public.profiles.full_name),
      phone = coalesce(p_profile->>'phone', public.profiles.phone),
      updated_at = now();

  -- upsert nurse settings
  insert into public.nurses_profiles (user_id, preferences, safety, commute, updated_at)
  values (v_uid, coalesce(p_prefs, '{}'::jsonb), coalesce(p_safety, '{}'::jsonb), coalesce(p_commute, '{}'::jsonb), now())
  on conflict (user_id) do update
  set preferences = coalesce(excluded.preferences, public.nurses_profiles.preferences),
      safety      = coalesce(excluded.safety, public.nurses_profiles.safety),
      commute     = coalesce(excluded.commute, public.nurses_profiles.commute),
      updated_at  = now();

  -- create/append contract
  insert into public.contracts (
    user_id, hospital, unit, shift_type, start_date, length_weeks, stipend_weekly, pet_status, parking_needs
  ) values (
    v_uid,
    p_contract->>'hospital',
    p_contract->>'unit',
    p_contract->>'shift_type',
    (p_contract->>'start_date')::date,
    nullif(p_contract->>'length_weeks','')::int,
    nullif(p_contract->>'stipend_weekly','')::int,
    p_contract->>'pet_status',
    p_contract->>'parking_needs'
  )
  returning id into v_contract_id;

  return json_build_object('ok', true, 'contract_id', v_contract_id);
end;
$$;
