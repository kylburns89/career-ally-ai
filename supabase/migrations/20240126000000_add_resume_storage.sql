-- Enable storage
create policy "Users can upload resume files"
  on storage.objects for insert
  with check (bucket_id = 'resumes' AND auth.uid() = owner);

create policy "Users can update resume files"
  on storage.objects for update
  using (bucket_id = 'resumes' AND auth.uid() = owner);

create policy "Users can read resume files"
  on storage.objects for select
  using (bucket_id = 'resumes' AND auth.uid() = owner);

create policy "Users can delete resume files"
  on storage.objects for delete
  using (bucket_id = 'resumes' AND auth.uid() = owner);

-- Add file_url to resumes table
alter table resumes
add column file_url text;
