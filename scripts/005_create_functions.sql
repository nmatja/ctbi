-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to calculate average ratings for clips
create or replace function public.get_clip_average_rating(clip_uuid uuid)
returns table (
  avg_technique numeric,
  avg_creativity numeric,
  avg_tone numeric,
  avg_overall numeric,
  total_reviews bigint
)
language sql
stable
as $$
  select 
    round(avg(technique_rating), 2) as avg_technique,
    round(avg(creativity_rating), 2) as avg_creativity,
    round(avg(tone_rating), 2) as avg_tone,
    round(avg(overall_rating), 2) as avg_overall,
    count(*) as total_reviews
  from public.reviews 
  where clip_id = clip_uuid;
$$;
