-- Create reviews table with rating system
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  clip_id uuid not null references public.clips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Rating categories for guitar clips
  technique_rating integer check (technique_rating >= 1 and technique_rating <= 5),
  creativity_rating integer check (creativity_rating >= 1 and creativity_rating <= 5),
  tone_rating integer check (tone_rating >= 1 and tone_rating <= 5),
  overall_rating integer check (overall_rating >= 1 and overall_rating <= 5),
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure one review per user per clip
  unique(clip_id, user_id)
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Create policies for reviews
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "reviews_delete_own"
  on public.reviews for delete
  using (auth.uid() = user_id);
