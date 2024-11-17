-- Add analysis column to resumes table
alter table resumes
add column analysis jsonb;

-- Update RLS policies to include analysis
drop policy if exists "Users can view own resumes" on resumes;
drop policy if exists "Users can update own resumes" on resumes;

create policy "Users can view own resumes"
  on resumes for select
  using (auth.uid() = user_id);

create policy "Users can update own resumes"
  on resumes for update
  using (auth.uid() = user_id);
