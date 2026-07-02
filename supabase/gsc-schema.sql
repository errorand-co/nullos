-- GSC daily data — time-series storage for Search Console metrics.
-- One row per day per property per dimension combination.
-- Written by n8n daily pipeline, read by the dashboard.

create table if not exists public.gsc_daily_data (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  site_url text not null,
  date date not null,
  dimension_type text not null,  -- 'totals', 'query', 'page', 'country', 'device'
  dimension_key text not null default '',  -- the query string, URL, country code, device name
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric not null default 0,
  position numeric not null default 0
);

-- Index for fast dashboard queries
create index if not exists idx_gsc_daily_user_site_date on public.gsc_daily_data(user_id, site_url, date desc);
create index if not exists idx_gsc_daily_dimension on public.gsc_daily_data(user_id, site_url, dimension_type, date desc);

alter table public.gsc_daily_data enable row level security;

drop policy if exists "users manage own gsc data" on public.gsc_daily_data;
create policy "users manage own gsc data"
on public.gsc_daily_data
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant all on public.gsc_daily_data to authenticated, anon;
grant usage, select on sequence public.gsc_daily_data_id_seq to authenticated, anon;