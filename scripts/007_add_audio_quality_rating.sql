-- Add audio_quality_rating column to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS audio_quality_rating INTEGER CHECK (audio_quality_rating >= 1 AND audio_quality_rating <= 5);

-- Update the get_clips_with_stats function to include audio_quality_rating in average calculation
CREATE OR REPLACE FUNCTION get_clips_with_stats()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  file_url TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ,
  user_id UUID,
  avg_rating NUMERIC,
  review_count BIGINT,
  comment_count BIGINT,
  display_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    c.file_url,
    c.duration_seconds,
    c.created_at,
    c.user_id,
    COALESCE(
      (SELECT AVG((technique_rating + creativity_rating + tone_rating + COALESCE(audio_quality_rating, 0) + overall_rating) / 
        CASE WHEN audio_quality_rating IS NOT NULL THEN 5.0 ELSE 4.0 END)
       FROM reviews WHERE clip_id = c.id), 0
    ) as avg_rating,
    COALESCE((SELECT COUNT(*) FROM reviews WHERE clip_id = c.id), 0) as review_count,
    COALESCE((SELECT COUNT(*) FROM comments WHERE clip_id = c.id), 0) as comment_count,
    p.display_name,
    p.avatar_url
  FROM clips c
  LEFT JOIN profiles p ON c.user_id = p.id
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;
