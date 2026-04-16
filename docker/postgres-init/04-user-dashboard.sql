-- Migration: User Dashboard Support
-- Adds user_id tracking to merchandise and extends talent profiles with portfolio links
-- Safe for existing databases with IF EXISTS clauses

-- ============================================
-- TALENT PROFILES EXTENSIONS
-- ============================================

-- Add portfolio_links (for artists) and social_media_links if not exists
ALTER TABLE IF EXISTS talent_profiles
  ADD COLUMN IF NOT EXISTS portfolio_links TEXT[] DEFAULT '{}';

ALTER TABLE IF EXISTS talent_profiles
  ADD COLUMN IF NOT EXISTS lore TEXT;

ALTER TABLE IF EXISTS talent_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE IF EXISTS talent_profiles
  ADD COLUMN IF NOT EXISTS height TEXT;

ALTER TABLE IF EXISTS talent_profiles
  ADD COLUMN IF NOT EXISTS species TEXT;

ALTER TABLE IF EXISTS talent_profiles
  ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}';

ALTER TABLE IF EXISTS talent_profiles
  ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT '{}';

-- ============================================
-- ARTIST PROFILES TABLE (for artists role)
-- ============================================

CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialty TEXT[] DEFAULT '{}',
  portfolio_links TEXT[] DEFAULT '{}',
  commissions_open BOOLEAN DEFAULT false,
  price_range TEXT,
  contact_email TEXT,
  social_media_links JSONB DEFAULT '{"twitter": null, "instagram": null, "website": null}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MERCHANDISE TABLE EXTENSIONS
-- ============================================

-- Add user_id to merchandise if it doesn't exist (for user-owned merchandise)
ALTER TABLE IF EXISTS merchandise
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Update existing records without user_id to point to talent_id's user (if relationship exists)
-- This is a one-time migration to link existing merchandise to users via their talent profile
UPDATE merchandise m
SET user_id = tp.user_id
WHERE m.user_id IS NULL AND m.talent_id IS NOT NULL AND EXISTS (
  SELECT 1 FROM talent_profiles tp WHERE m.talent_id = tp.id
);

-- Create index for user merchandise queries
CREATE INDEX IF NOT EXISTS idx_merchandise_user_id ON merchandise(user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to artist_profiles if it doesn't exist
DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON artist_profiles;
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_published ON artist_profiles(is_published);
CREATE UNIQUE INDEX IF NOT EXISTS idx_artist_profiles_user_id_unique ON artist_profiles(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_talent_profiles_user_id_unique ON talent_profiles(user_id);
