-- Create storage bucket for audio clips
insert into storage.buckets (id, name, public)
values ('clips', 'clips', true)
on conflict (id) do nothing;

-- Storage policies for clips bucket
create policy "Users can upload their own clips"
on storage.objects for insert
with check (
  bucket_id = 'clips' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view all clips"
on storage.objects for select
using (bucket_id = 'clips');

create policy "Users can update their own clips"
on storage.objects for update
using (
  bucket_id = 'clips' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own clips"
on storage.objects for delete
using (
  bucket_id = 'clips' 
  and auth.uid()::text = (storage.foldername(name))[1]
);
