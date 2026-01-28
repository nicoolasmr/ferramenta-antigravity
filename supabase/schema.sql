-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: profiles
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  timezone text default 'America/Sao_Paulo',
  updated_at timestamp with time zone default now()
);

-- Table: preferences
create table public.preferences (
  user_id uuid not null references auth.users(id) on delete cascade primary key,
  reminder_enabled boolean default false,
  reminder_time time without time zone,
  high_contrast boolean default false,
  density text check (density in ('compact', 'comfortable')) default 'comfortable',
  updated_at timestamp with time zone default now()
);

-- Table: daily_checks
create table public.daily_checks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  payload jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Table: weekly_plans
create table public.weekly_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  payload jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, week_start)
);

-- Table: impact_logs
create table public.impact_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  payload jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Table: dismissed_alerts
create table public.dismissed_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  alert_id text not null,
  dismissed_at timestamp with time zone default now(),
  unique(user_id, alert_id)
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.preferences enable row level security;
alter table public.daily_checks enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.impact_logs enable row level security;
alter table public.dismissed_alerts enable row level security;

-- Policy: Users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own preferences" on public.preferences for select using (auth.uid() = user_id);
create policy "Users can update own preferences" on public.preferences for update using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.preferences for insert with check (auth.uid() = user_id);

create policy "Users can view own daily_checks" on public.daily_checks for select using (auth.uid() = user_id);
create policy "Users can insert own daily_checks" on public.daily_checks for insert with check (auth.uid() = user_id);
create policy "Users can update own daily_checks" on public.daily_checks for update using (auth.uid() = user_id);
create policy "Users can delete own daily_checks" on public.daily_checks for delete using (auth.uid() = user_id);

create policy "Users can view own weekly_plans" on public.weekly_plans for select using (auth.uid() = user_id);
create policy "Users can insert own weekly_plans" on public.weekly_plans for insert with check (auth.uid() = user_id);
create policy "Users can update own weekly_plans" on public.weekly_plans for update using (auth.uid() = user_id);
create policy "Users can delete own weekly_plans" on public.weekly_plans for delete using (auth.uid() = user_id);

create policy "Users can view own impact_logs" on public.impact_logs for select using (auth.uid() = user_id);
create policy "Users can insert own impact_logs" on public.impact_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own impact_logs" on public.impact_logs for update using (auth.uid() = user_id);
create policy "Users can delete own impact_logs" on public.impact_logs for delete using (auth.uid() = user_id);

create policy "Users can view own dismissed_alerts" on public.dismissed_alerts for select using (auth.uid() = user_id);
create policy "Users can insert own dismissed_alerts" on public.dismissed_alerts for insert with check (auth.uid() = user_id);
create policy "Users can delete own dismissed_alerts" on public.dismissed_alerts for delete using (auth.uid() = user_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  insert into public.preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
