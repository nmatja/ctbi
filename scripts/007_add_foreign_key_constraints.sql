-- Add foreign key constraints to establish proper relationships between tables

-- Add foreign key constraint from clips.user_id to profiles.id
ALTER TABLE clips 
ADD CONSTRAINT clips_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from comments.user_id to profiles.id
ALTER TABLE comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from comments.clip_id to clips.id
ALTER TABLE comments 
ADD CONSTRAINT comments_clip_id_fkey 
FOREIGN KEY (clip_id) REFERENCES clips(id) ON DELETE CASCADE;

-- Add foreign key constraint from reviews.user_id to profiles.id
ALTER TABLE reviews 
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from reviews.clip_id to clips.id
ALTER TABLE reviews 
ADD CONSTRAINT reviews_clip_id_fkey 
FOREIGN KEY (clip_id) REFERENCES clips(id) ON DELETE CASCADE;
