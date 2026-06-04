create table if not exists public.websites (
  id text primary key,
  name text not null,
  url text not null unique,
  sector text not null default '',
  audience text not null default '',
  data jsonb not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant usage on schema public to service_role;
grant all on table public.websites to service_role;

alter table public.websites enable row level security;

drop policy if exists "service role manages websites" on public.websites;
create policy "service role manages websites"
on public.websites
for all
to service_role
using (true)
with check (true);

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
for each row
execute function public.set_updated_at();

create table if not exists public.tracked_keywords (
  id text primary key,
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

grant all privileges on table public.tracked_keywords to service_role;

alter table public.tracked_keywords enable row level security;

drop policy if exists "service role manages tracked keywords" on public.tracked_keywords;
create policy "service role manages tracked keywords"
on public.tracked_keywords
for all
to service_role
using (true)
with check (true);

drop trigger if exists tracked_keywords_set_updated_at on public.tracked_keywords;
create trigger tracked_keywords_set_updated_at
before update on public.tracked_keywords
for each row
execute function public.set_updated_at();
