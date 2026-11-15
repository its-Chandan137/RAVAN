-- RAVAN initial schema
-- Apply this file to your existing Supabase project via the SQL editor or `supabase db push`.

create extension if not exists "pgcrypto";

-- Activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Other',
  time_label text,
  group_name text not null default 'Morning',
  start_time time,
  end_time time,
  points integer not null default 1,
  schedule_days smallint[] not null default '{0,1,2,3,4,5,6}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Activity logs (completion history with snapshots)
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid references public.activities(id) on delete set null,
  activity_name_snapshot text not null,
  category_snapshot text not null,
  points_snapshot integer not null default 1,
  scheduled_time_snapshot text,
  activity_date date not null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (activity_id, activity_date)
);

create index if not exists idx_activity_logs_date on public.activity_logs(activity_date);
create index if not exists idx_activity_logs_activity on public.activity_logs(activity_id);

-- App settings (extensible key/value store)
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists activities_set_updated_at on public.activities;
create trigger activities_set_updated_at before update on public.activities
  for each row execute function public.set_updated_at();

drop trigger if exists activity_logs_set_updated_at on public.activity_logs;
create trigger activity_logs_set_updated_at before update on public.activity_logs
  for each row execute function public.set_updated_at();

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at before update on public.app_settings
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.activities enable row level security;
alter table public.activity_logs enable row level security;
alter table public.app_settings enable row level security;

-- Since the app uses a custom password session (not Supabase Auth),
-- all data access goes through server-side routes using the service role key.
-- These policies keep anon/public access blocked. Server (service role) bypasses RLS.
create policy "no_anon_activities" on public.activities for all to anon using (false);
create policy "no_anon_activity_logs" on public.activity_logs for all to anon using (false);
create policy "no_anon_app_settings" on public.app_settings for all to anon using (false);