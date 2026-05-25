-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Daily logs — the core of everything
create table daily_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  planned text not null,          -- what you planned to do
  actual text not null,           -- what you actually did
  reflection text not null,       -- why the gap happened (short)
  mood text check (mood in ('focused', 'scattered', 'dead', 'on-fire', 'just-existing')) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)           -- one log per user per day
);

-- Accountability partners (Phase 2)
create table accountability_partners (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  partner_id uuid references auth.users(id) on delete cascade not null,
  status text check (status in ('pending', 'active', 'rejected')) default 'pending',
  created_at timestamptz default now(),
  unique(user_id, partner_id)
);

-- RLS: users can only see their own logs
alter table daily_logs enable row level security;

create policy "Users can view own logs"
  on daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on daily_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own logs"
  on daily_logs for delete
  using (auth.uid() = user_id);

-- Partners: users see rows where they are either party
alter table accountability_partners enable row level security;

create policy "Users can view own partnerships"
  on accountability_partners for select
  using (auth.uid() = user_id or auth.uid() = partner_id);

create policy "Users can create partnerships"
  on accountability_partners for insert
  with check (auth.uid() = user_id);

create policy "Partners can update status"
  on accountability_partners for update
  using (auth.uid() = partner_id);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger daily_logs_updated_at
  before update on daily_logs
  for each row execute function update_updated_at();
