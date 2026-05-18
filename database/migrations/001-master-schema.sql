-- Master Database Schema Migration
-- Consolidated from previous individual migrations
-- This single file contains all necessary schema setup for StarMy

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- UTILITY FUNCTION: update_updated_at_column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- PORTFOLIO ART IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_art_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_object_key TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_art_images_artist_id ON portfolio_art_images(artist_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_art_images_sort_order ON portfolio_art_images(artist_id, sort_order);

DROP TRIGGER IF EXISTS update_portfolio_art_images_updated_at ON portfolio_art_images;
CREATE TRIGGER update_portfolio_art_images_updated_at BEFORE UPDATE ON portfolio_art_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TALENT PROFILES ENHANCEMENTS
-- ============================================
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS vtuber_model_url TEXT;
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE IF NOT EXISTS talent_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE IF NOT EXISTS talent_profiles ADD COLUMN IF NOT EXISTS species TEXT;
ALTER TABLE IF NOT EXISTS talent_profiles ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}';
ALTER TABLE IF NOT EXISTS talent_profiles ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS portfolio_links TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE IF NOT EXISTS talent_profiles ADD COLUMN IF NOT EXISTS debut_date DATE;
ALTER TABLE IF NOT EXISTS talent_profiles ADD COLUMN IF NOT EXISTS portrait_pictures JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF NOT EXISTS talent_profiles ADD COLUMN IF NOT EXISTS profile_card_url TEXT;
ALTER TABLE IF NOT EXISTS talent_profiles ADD COLUMN IF NOT EXISTS support_url TEXT;

-- Backfill portrait_pictures array from legacy column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'talent_profiles'
      AND column_name = 'portrait_picture_url'
  ) THEN
    EXECUTE '
      UPDATE talent_profiles
      SET portrait_pictures = CASE
        WHEN portrait_picture_url IS NOT NULL THEN jsonb_build_array(
          jsonb_build_object(''url'', portrait_picture_url, ''object_key'', portrait_picture_object_key)
        )
        ELSE ''[]''::jsonb
      END
      WHERE portrait_pictures = ''[]''::jsonb AND portrait_picture_url IS NOT NULL
    ';
  END IF;
END $$;

-- ============================================
-- ARTIST PROFILES ENHANCEMENTS
-- ============================================
ALTER TABLE IF EXISTS artist_profiles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS artist_profiles ADD COLUMN IF NOT EXISTS portfolio_art TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS artist_profiles ADD COLUMN IF NOT EXISTS portfolio_art_images JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- PORTFOLIO ART TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_art (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title TEXT,
  image_url TEXT NOT NULL,
  image_object_key TEXT,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_art_artist_id ON portfolio_art(artist_id);

-- ============================================
-- STAFF POSITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  required_skills TEXT[] DEFAULT '{}',
  is_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_positions_open ON staff_positions(is_open);

DROP TRIGGER IF EXISTS update_staff_positions_updated_at ON staff_positions;
CREATE TRIGGER update_staff_positions_updated_at BEFORE UPDATE ON staff_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- EVENTS ENHANCEMENTS
-- ============================================
ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS image_object_key TEXT;

CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);

-- ============================================
-- GALLERY ITEMS ENHANCEMENTS
-- ============================================
ALTER TABLE IF EXISTS gallery_items ADD COLUMN IF NOT EXISTS image_object_key TEXT;
ALTER TABLE IF NOT EXISTS gallery_items ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON gallery_items(featured);

-- ============================================
-- MERCHANDISE ENHANCEMENTS
-- ============================================
ALTER TABLE IF EXISTS merchandise ADD COLUMN IF NOT EXISTS image_object_key TEXT;
ALTER TABLE IF NOT EXISTS merchandise ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Update existing merchandise records to link to users via talent profile
UPDATE merchandise m
SET user_id = tp.user_id
FROM talent_profiles tp
WHERE m.user_id IS NULL
  AND m.talent_id IS NOT NULL
  AND m.talent_id = tp.id;

CREATE INDEX IF NOT EXISTS idx_merchandise_user_id ON merchandise(user_id);

-- ============================================
-- PROFILES ENHANCEMENTS
-- ============================================
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS avatar_object_key TEXT;

-- ============================================
-- EMAIL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email_to text NOT NULL,
  email_type text NOT NULL,
  subject text,
  status text NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_logs_user_id_idx ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS email_logs_status_idx ON email_logs(status);
