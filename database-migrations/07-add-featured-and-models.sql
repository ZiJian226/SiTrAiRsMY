-- Migration: Add featured fields, vtuber models, and portfolio art
-- Date: 2026-04-19

-- ============================================
-- TALENT PROFILES - Add vtuber model and featured
-- ============================================
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS vtuber_model_url TEXT;
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS species TEXT;
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}';
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT '{}';
ALTER TABLE talent_profiles ADD COLUMN IF NOT EXISTS portfolio_links TEXT[] DEFAULT '{}';

-- ============================================
-- ARTIST PROFILES - Add portfolio art and featured
-- ============================================
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS portfolio_art TEXT[] DEFAULT '{}';

-- ============================================
-- PORTFOLIO ART TABLE - Store artist art pieces
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

-- ============================================
-- EVENTS - Add featured field if not exists
-- ============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- ============================================
-- GALLERY ITEMS - Featured field already exists
-- ============================================
-- No changes needed, featured column exists

-- ============================================
-- STAFF POSITIONS TABLE - For career page
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

-- ============================================
-- INDEXES FOR NEW COLUMNS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_talent_profiles_featured ON talent_profiles(featured);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_featured ON artist_profiles(featured);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_art_artist_id ON portfolio_art(artist_id);
CREATE INDEX IF NOT EXISTS idx_staff_positions_open ON staff_positions(is_open);

-- ============================================
-- TRIGGERS FOR NEW TABLES
-- ============================================
DROP TRIGGER IF EXISTS update_portfolio_art_updated_at ON portfolio_art;
CREATE TRIGGER update_portfolio_art_updated_at BEFORE UPDATE ON portfolio_art
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_positions_updated_at ON staff_positions;
CREATE TRIGGER update_staff_positions_updated_at BEFORE UPDATE ON staff_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing trigger for artist_profiles if it doesn't have one
DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON artist_profiles;
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
