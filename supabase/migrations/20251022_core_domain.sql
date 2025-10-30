-- Core nurse housing domain tables required by downstream migrations.

create extension if not exists pgcrypto;

-- Nurse contracts (assignment intake)
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  nurse_user_id uuid not null references public.profiles(id) on delete cascade,
  hospital text not null,
  hospital_lat numeric,
  hospital_lng numeric,
  unit text,
  shift_type text default 'day' check (shift_type in ('day','night','swing')),
  start_date date,
  end_date date,
  weekly_stipend int,
  total_budget int,
  pets boolean default false,
  parking_needed boolean default false,
  notes text,
  status text not null default 'active' check (status in ('draft','active','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.contracts_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists trg_contracts_updated on public.contracts;
create trigger trg_contracts_updated
before update on public.contracts
for each row execute function public.contracts_touch_updated_at();

alter table public.contracts enable row level security;

drop policy if exists "contracts_self" on public.contracts;
create policy "contracts_self"
on public.contracts for select
using (nurse_user_id = auth.uid());

drop policy if exists "contracts_rw_self" on public.contracts;
create policy "contracts_rw_self"
on public.contracts for all
using (nurse_user_id = auth.uid())
with check (nurse_user_id = auth.uid());

-- Swipe decisions
create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  direction text not null check (direction in ('like','pass')),
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.likes enable row level security;

drop policy if exists "likes_self" on public.likes;
create policy "likes_self"
on public.likes for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Match records between nurses and owners
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  nurse_user_id uuid not null references public.profiles(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','active','chat','hold','booked','closed','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.matches_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists trg_matches_updated on public.matches;
create trigger trg_matches_updated
before update on public.matches
for each row execute function public.matches_touch_updated_at();

alter table public.matches enable row level security;

drop policy if exists "matches_participants" on public.matches;
create policy "matches_participants"
on public.matches for select
using (auth.uid() in (nurse_user_id, owner_user_id));

drop policy if exists "matches_update_participants" on public.matches;
create policy "matches_update_participants"
on public.matches for update
using (auth.uid() in (nurse_user_id, owner_user_id))
with check (auth.uid() in (nurse_user_id, owner_user_id));

-- Conversations (double opt-in chat)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  nurse_user_id uuid not null references public.profiles(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

drop policy if exists "conversations_participants" on public.conversations;
create policy "conversations_participants"
on public.conversations for all
using (auth.uid() in (nurse_user_id, owner_user_id))
with check (auth.uid() in (nurse_user_id, owner_user_id));

-- Conversation messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.messages enable row level security;

drop policy if exists "messages_participants" on public.messages;
create policy "messages_participants"
on public.messages for all
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and auth.uid() in (c.nurse_user_id, c.owner_user_id)
  )
)
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and auth.uid() in (c.nurse_user_id, c.owner_user_id)
  )
);
