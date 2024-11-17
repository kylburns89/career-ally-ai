-- Create profiles table that extends Supabase auth.users
create table profiles (
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

-- Create resumes table
create table resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create cover_letters table
create table cover_letters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  content text not null,
  job_title text,
  company text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create applications table
create table applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  company text not null,
  job_title text not null,
  status text not null,
  applied_date timestamp with time zone not null,
  resume_id uuid references resumes(id) on delete set null,
  cover_letter_id uuid references cover_letters(id) on delete set null,
  notes text,
  next_steps text,
  salary integer,
  location text,
  job_post_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_histories table
create table chat_histories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
  messages jsonb[] not null default array[]::jsonb[],
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table resumes enable row level security;
alter table cover_letters enable row level security;
alter table applications enable row level security;
alter table chat_histories enable row level security;

-- Create policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can view own resumes"
  on resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert own resumes"
  on resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own resumes"
  on resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on resumes for delete
  using (auth.uid() = user_id);

create policy "Users can view own cover letters"
  on cover_letters for select
  using (auth.uid() = user_id);

create policy "Users can insert own cover letters"
  on cover_letters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cover letters"
  on cover_letters for update
  using (auth.uid() = user_id);

create policy "Users can delete own cover letters"
  on cover_letters for delete
  using (auth.uid() = user_id);

create policy "Users can view own applications"
  on applications for select
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on applications for update
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on applications for delete
  using (auth.uid() = user_id);

create policy "Users can view own chat histories"
  on chat_histories for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat histories"
  on chat_histories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chat histories"
  on chat_histories for update
  using (auth.uid() = user_id);

create policy "Users can delete own chat histories"
  on chat_histories for delete
  using (auth.uid() = user_id);

-- Create function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
  before update on profiles
  for each row
  execute function handle_updated_at();

create trigger handle_updated_at
  before update on resumes
  for each row
  execute function handle_updated_at();

create trigger handle_updated_at
  before update on cover_letters
  for each row
  execute function handle_updated_at();

create trigger handle_updated_at
  before update on applications
  for each row
  execute function handle_updated_at();

create trigger handle_updated_at
  before update on chat_histories
  for each row
  execute function handle_updated_at();
