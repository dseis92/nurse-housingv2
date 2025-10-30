-- Adjust score_listings to use contract length and avoid unused variables.

create or replace function public.score_listings(p_user_id uuid)
returns table(listing_id uuid, score numeric)
language plpgsql
security definer
as $$
declare
  v_stipend int := 1500;
  v_length int := 13;
  v_length_factor numeric := 0.7;
begin
  select
    coalesce(weekly_stipend, v_stipend),
    coalesce(length_weeks, v_length)
  into v_stipend, v_length
  from public.contracts
  where nurse_user_id = p_user_id
  order by created_at desc
  limit 1;

  v_length_factor := least(1.0, greatest(0.4, v_length::numeric / 13.0));

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
    select id, v_length_factor as quality_score
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
