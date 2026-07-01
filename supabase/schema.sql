-- SEO Insight schema — per-user RLS, no service-role bypass.
-- Run this in the Supabase SQL editor once.

-- Websites: each user owns their connected properties.
create table if not exists public.websites (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  sector text not null default '',
  audience text not null default '',
  data jsonb not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, url)
);

alter table public.websites enable row level security;

drop policy if exists "users manage own websites" on public.websites;
create policy "users manage own websites"
on public.websites
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Tracked keywords: each user owns their keyword watchlist.
create table if not exists public.tracked_keywords (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  site_id text not null,
  query text not null,
  current_position numeric not null,
  previous_position numeric not null,
  target_position integer not null,
  volume integer not null,
  difficulty text not null,
  status text not null,
  date_added date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tracked_keywords enable row level security;

drop policy if exists "users manage own keywords" on public.tracked_keywords;
create policy "users manage own keywords"
on public.tracked_keywords
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- updated_at trigger (shared).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists websites_set_updated_at on public.websites;
create trigger websites_set_updated_at
before update on public.websites
for each row execute function public.set_updated_at();

drop trigger if exists tracked_keywords_set_updated_at on public.tracked_keywords;
create trigger tracked_keywords_set_updated_at
before update on public.tracked_keywords
for each row execute function public.set_updated_at();