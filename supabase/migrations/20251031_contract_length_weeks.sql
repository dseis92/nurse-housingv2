-- Add length_weeks column for contract duration calculations.

alter table public.contracts
  add column if not exists length_weeks int;
