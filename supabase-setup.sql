-- Run in your Supabase SQL editor. Never expose the service role key in frontend code.
create table if not exists public.portfolio_likes (
 id bigint generated always as identity primary key,
 fingerprint text not null unique,
 created_at timestamptz not null default now()
);
alter table public.portfolio_likes enable row level security;
-- No public RLS policies: only the Netlify function using the service role key accesses this table.
