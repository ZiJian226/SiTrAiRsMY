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
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS height TEXT;
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS species TEXT;
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS likes TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS dislikes TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS portfolio_links TEXT[] DEFAULT '{}';
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS debut_date DATE;
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS portrait_pictures JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS profile_card_url TEXT;
ALTER TABLE IF EXISTS talent_profiles ADD COLUMN IF NOT EXISTS support_url TEXT;

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

DROP TRIGGER IF EXISTS update_portfolio_art_updated_at ON portfolio_art;
CREATE TRIGGER update_portfolio_art_updated_at BEFORE UPDATE ON portfolio_art
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
ALTER TABLE IF EXISTS gallery_items ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON gallery_items(featured);

-- ============================================
-- MERCHANDISE ENHANCEMENTS
-- ============================================
ALTER TABLE IF EXISTS merchandise ADD COLUMN IF NOT EXISTS image_object_key TEXT;
ALTER TABLE IF EXISTS merchandise ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

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

-- ============================================
-- USER AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT,
  category TEXT NOT NULL DEFAULT 'content',
  action TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'activity',
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  entity_type TEXT,
  entity_id TEXT,
  page_key TEXT,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES auth_sessions(id) ON DELETE SET NULL,
  status_before TEXT,
  status_after TEXT,
  location_country TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_audit_logs_actor_user_id ON user_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_target_user_id ON user_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_action ON user_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_category ON user_audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON user_audit_logs(created_at DESC);

-- ============================================
-- GALLERY MEDIA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gallery_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_item_id UUID NOT NULL REFERENCES gallery_items(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  media_object_key TEXT,
  thumbnail_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_media_gallery_item_id ON gallery_media(gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_gallery_media_is_primary ON gallery_media(gallery_item_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_gallery_media_sort_order ON gallery_media(gallery_item_id, sort_order);

DROP TRIGGER IF EXISTS update_gallery_media_updated_at ON gallery_media;
CREATE TRIGGER update_gallery_media_updated_at BEFORE UPDATE ON gallery_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TALENT PROFILES INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_talent_profiles_featured ON talent_profiles(featured);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_portrait_pictures ON talent_profiles USING gin(portrait_pictures);

-- ============================================
-- ARTIST PROFILES INDEXES & TRIGGER
-- ============================================
CREATE INDEX IF NOT EXISTS idx_artist_profiles_featured ON artist_profiles(featured);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_portfolio_art_images ON artist_profiles USING gin(portfolio_art_images);

DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON artist_profiles;
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMISSION REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS commission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_profile_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(12, 2),
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commission_requests_artist_profile_id ON commission_requests(artist_profile_id);
CREATE INDEX IF NOT EXISTS idx_commission_requests_status ON commission_requests(status);
CREATE INDEX IF NOT EXISTS idx_commission_requests_created_at ON commission_requests(created_at DESC);

DROP TRIGGER IF EXISTS update_commission_requests_updated_at ON commission_requests;
CREATE TRIGGER update_commission_requests_updated_at BEFORE UPDATE ON commission_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SPECIAL COLUMN CLEANUP
-- ============================================
ALTER TABLE IF EXISTS career_applications ADD COLUMN IF NOT EXISTS tiktok_username TEXT;

-- Drop legacy column that was replaced with portrait_pictures array
ALTER TABLE IF EXISTS talent_profiles DROP COLUMN IF EXISTS lore;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
