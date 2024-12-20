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

-- Function to check if user has access to profile
create or replace function auth.user_has_profile_access(profile_id uuid)
returns boolean as $$
declare
  user_email text;
  profile_email text;
begin
  -- Get current user's email
  select email into user_email
  from auth.users
  where id = auth.uid();

  -- Get profile owner's email
  select email into profile_email
  from auth.users
  where id = profile_id;

  -- Return true if emails match (linked accounts) or if it's the user's own profile
  return (user_email = profile_email) or (auth.uid() = profile_id);
end;
$$ language plpgsql security definer;

-- Recreate policies with support for linked accounts
create policy "Users can view own profile"
  on profiles for select
  using (auth.user_has_profile_access(id));

create policy "Users can update own profile"
  on profiles for update
  using (auth.user_has_profile_access(id));

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Function to handle profile copying for linked accounts
create or replace function handle_linked_profiles()
returns trigger as $$
declare
  source_profile profiles;
  user_email text;
begin
  -- Get the email of the new user
  select email into user_email
  from auth.users
  where id = new.id;

  -- Find existing profile with the same email
  select p.* into source_profile
  from profiles p
  join auth.users u on u.id = p.id
  where u.email = user_email
  limit 1;

  -- If a profile exists for a linked account, copy it
  if found then
    insert into profiles (
      id, title, bio, location, years_experience,
      skills, industries, education, work_history,
      desired_salary, desired_location, remote_only,
      linkedin, github, portfolio
    )
    values (
      new.id, source_profile.title, source_profile.bio,
      source_profile.location, source_profile.years_experience,
      source_profile.skills, source_profile.industries,
      source_profile.education, source_profile.work_history,
      source_profile.desired_salary, source_profile.desired_location,
      source_profile.remote_only, source_profile.linkedin,
      source_profile.github, source_profile.portfolio
    );
    return null; -- Prevent default insert
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for handling linked profiles
drop trigger if exists handle_linked_profiles on auth.users;
create trigger handle_linked_profiles
  after insert on auth.users
  for each row
  execute function handle_linked_profiles();

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
