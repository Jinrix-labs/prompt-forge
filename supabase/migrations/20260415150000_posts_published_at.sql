-- When a scheduled post is actually sent via cron (or backfilled).
alter table public.posts
    add column if not exists published_at timestamptz;
