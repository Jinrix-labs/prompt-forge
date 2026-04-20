-- Atomically spend user credits to prevent double-spend race conditions.
create or replace function public.spend_credit(p_user_id text, p_amount int default 1)
returns boolean
language plpgsql
security definer
as $$
declare
    v_updated int;
begin
    update public.user_credits
    set credits = credits - p_amount,
        updated_at = now()
    where user_id = p_user_id
      and credits >= p_amount;

    get diagnostics v_updated = row_count;

    return v_updated > 0;
end;
$$;
