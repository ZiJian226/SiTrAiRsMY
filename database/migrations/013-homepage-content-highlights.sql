-- Migration 013: Add homepage content highlights table
-- Stores video content for the homepage highlights section (2-column autoplay videos with popout)

CREATE TABLE IF NOT EXISTS homepage_content_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  video_object_key TEXT,
  thumbnail_url TEXT,
  thumbnail_object_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_content_highlights_is_active ON homepage_content_highlights(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_content_highlights_sort_order ON homepage_content_highlights(sort_order);

-- Create trigger for auto update_updated_at
DROP TRIGGER IF EXISTS update_homepage_content_highlights_updated_at ON homepage_content_highlights;
CREATE TRIGGER update_homepage_content_highlights_updated_at BEFORE UPDATE ON homepage_content_highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();