-- Create clips table for audio uploads
create table if not exists public.clips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text not null,
  file_size integer not null,
  duration_seconds integer not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.clips enable row level security;

-- Create policies for clips
create policy "clips_select_all"
  on public.clips for select
  using (true);

create policy "clips_insert_own"
  on public.clips for insert
  with check (auth.uid() = user_id);

create policy "clips_update_own"
  on public.clips for update
  using (auth.uid() = user_id);

create policy "clips_delete_own"
  on public.clips for delete
  using (auth.uid() = user_id);
