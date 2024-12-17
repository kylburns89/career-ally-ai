-- Migration to add linked accounts support
-- This migration preserves all existing data while adding new functionality

begin;

-- Safely create function to check if user has access to profile
-- This does not affect existing data
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

-- Safely update policies without affecting data
-- First check if policies exist to avoid errors
do $$
begin
  -- Drop policies if they exist
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can view own profile') then
    drop policy "Users can view own profile" on profiles;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update own profile') then
    drop policy "Users can update own profile" on profiles;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can insert own profile') then
    drop policy "Users can insert own profile" on profiles;
  end if;
end$$;

-- Create new policies that support linked accounts
-- These policies only change access rules, not the underlying data
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
-- This only affects new user creations, not existing data
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

-- Safely create trigger for handling linked profiles
-- First remove if exists to avoid errors
drop trigger if exists handle_linked_profiles on auth.users;

-- Create new trigger that only affects new user creations
create trigger handle_linked_profiles
  after insert on auth.users
  for each row
  execute function handle_linked_profiles();

commit;

-- Verification query to ensure no data was lost
-- Run this after migration to verify data integrity
-- select count(*) as profile_count from profiles;
