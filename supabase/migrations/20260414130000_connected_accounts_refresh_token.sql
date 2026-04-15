-- OAuth2 refresh tokens (e.g. X/Twitter with offline.access)
alter table public.connected_accounts
    add column if not exists refresh_token text;
