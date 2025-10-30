create table if not exists public.nurse_onboarding (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.nurse_onboarding enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='nurse_onboarding' and policyname='read own onboarding') then
    create policy "read own onboarding"
      on public.nurse_onboarding
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='nurse_onboarding' and policyname='upsert own onboarding') then
    create policy "upsert own onboarding"
      on public.nurse_onboarding
      for all
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

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
  values (v_user, p_input, now())
  on conflict (user_id) do update
    set payload = excluded.payload,
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
  v_payload jsonb;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select payload into v_payload
  from public.nurse_onboarding
  where user_id = v_user;

  return v_payload;
end;
$$;
