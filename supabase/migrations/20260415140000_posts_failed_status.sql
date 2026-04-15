-- Allow recording publish failures; optional human-readable error summary.
alter table public.posts drop constraint if exists posts_status_check;

alter table public.posts
    add constraint posts_status_check
    check (status in ('published', 'scheduled', 'draft', 'failed'));

alter table public.posts
    add column if not exists error_message text;
