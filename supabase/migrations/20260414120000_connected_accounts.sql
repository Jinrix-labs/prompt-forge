-- Instagram (and future) connected accounts — Clerk user_id in user_id column.
-- Apply in Supabase: SQL Editor > New query > Run, or `supabase db push` if you use the CLI.

create table if not exists public.connected_accounts (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    platform text not null,
    platform_user_id text not null,
    platform_username text,
    access_token text not null,
    token_expires_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint connected_accounts_user_platform_unique unique (user_id, platform)
);

create index if not exists connected_accounts_user_id_idx
    on public.connected_accounts (user_id);

comment on table public.connected_accounts is 'OAuth tokens for social platforms; user_id is Clerk ID. Written only by server routes using service role.';

alter table public.connected_accounts enable row level security;

-- Service role bypasses RLS; anon/authenticated clients have no policies (no direct access).
