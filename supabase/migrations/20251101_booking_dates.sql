-- Extend holds with start/end dates and update create_hold function

alter table public.holds
  add column if not exists start_date date,
  add column if not exists end_date date;

create or replace function public.create_hold(p_match_id uuid, p_amount_cents int default 2000, p_start_date date default null, p_end_date date default null)
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
