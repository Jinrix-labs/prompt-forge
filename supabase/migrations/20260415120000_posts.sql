-- Social posts created from Compose (user_id = Clerk ID)
create table if not exists public.posts (
    id uuid primary key default gen_random_uuid(),
    user_id text not null,
    content text not null,
    platforms text[] not null,
    image_url text,
    scheduled_at timestamptz,
    status text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint posts_status_check check (status in ('published', 'scheduled', 'draft'))
);

create index if not exists posts_user_id_idx on public.posts (user_id);
create index if not exists posts_scheduled_at_idx on public.posts (scheduled_at)
    where scheduled_at is not null;

comment on table public.posts is 'Compose UI posts; publishing to networks is not implemented in API yet.';

alter table public.posts enable row level security;
