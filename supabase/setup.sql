-- Check if profiles table exists and create if not
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  title text,
  bio text,
  location text,
  years_experience integer,
  skills text[] default array[]::text[],
  industries text[] default array[]::text[],
  education jsonb[] default array[]::jsonb[],
  work_history jsonb[] default array[]::jsonb[],
  desired_salary integer,
  desired_location text,
  remote_only boolean default false,
  linkedin text,
  github text,
  portfolio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

-- Recreate policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Create or replace the updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop and recreate the trigger
drop trigger if exists handle_updated_at on profiles;
create trigger handle_updated_at
  before update on profiles
  for each row
  execute function handle_updated_at();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on profiles to anon, authenticated;
