-- ============================================
-- StarMyriad Database Initialization Script
-- Consolidated Migration - All-in-One Setup
-- ============================================
-- This is the SINGLE source of truth for database schema
-- Run this once on fresh PostgreSQL instance

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  last_seen_ip_address TEXT,
  last_seen_country TEXT,
  last_seen_user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token_hash ON auth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_last_seen_at ON auth_sessions(last_seen_at DESC);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('talent', 'staff', 'artist', 'admin')),
  avatar_url TEXT,
  avatar_object_key TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- TALENT & ARTIST PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  character_description TEXT,
  bio TEXT,
  debut_date DATE,
  date_of_birth DATE,
  height TEXT,
  species TEXT,
  likes TEXT[] DEFAULT '{}',
  dislikes TEXT[] DEFAULT '{}',
  portfolio_links TEXT[] DEFAULT '{}',
  vtuber_model_url TEXT,
  profile_picture_url TEXT,
  profile_picture_object_key TEXT,
  portrait_picture_url TEXT,
  portrait_picture_object_key TEXT,
  portrait_pictures JSONB DEFAULT '[]'::jsonb,
  profile_card_url TEXT,
  support_url TEXT,
  featured_video_url TEXT,
  social_links JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON talent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_featured ON talent_profiles(featured);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_portrait_pictures ON talent_profiles USING gin(portrait_pictures);

CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialty TEXT[] DEFAULT '{}',
  portfolio_links TEXT[] DEFAULT '{}',
  portfolio_art TEXT[] DEFAULT '{}',
  portfolio_art_images JSONB DEFAULT '[]'::jsonb,
  commissions_open BOOLEAN DEFAULT false,
  price_range TEXT,
  contact_email TEXT,
  social_media_links JSONB DEFAULT '{"twitter": null, "instagram": null, "website": null}',
  featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_featured ON artist_profiles(featured);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_portfolio_art_images ON artist_profiles USING gin(portfolio_art_images);

-- ============================================
-- PORTFOLIO & ART
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
-- CONTENT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  image_object_key TEXT,
  category TEXT,
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  image_object_key TEXT,
  description TEXT,
  category TEXT,
  artist_name TEXT,
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON gallery_items(featured);

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
CREATE INDEX IF NOT EXISTS idx_gallery_media_sort_order ON gallery_media(gallery_item_id, sort_order);

CREATE TABLE IF NOT EXISTS merchandise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  image_object_key TEXT,
  category TEXT NOT NULL,
  talent_id UUID REFERENCES talent_profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stock INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchandise_user_id ON merchandise(user_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_talent_id ON merchandise(talent_id);

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  portfolio_url TEXT,
  tiktok_username TEXT,
  motivation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at DESC);

CREATE TABLE IF NOT EXISTS agency_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  discord_name TEXT,
  is_malaysian BOOLEAN,
  supporting_info TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agency_applications_status ON agency_applications(status);
CREATE INDEX IF NOT EXISTS idx_agency_applications_created_at ON agency_applications(created_at DESC);

-- ============================================
-- ADMIN & SETTINGS
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

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

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
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_session_id ON user_audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_action ON user_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_category ON user_audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON user_audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email_to text NOT NULL,
  email_type text NOT NULL,
  subject text,
  status text NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- ============================================
-- HOMEPAGE SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS homepage_hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL DEFAULT 'slideshow' CHECK (mode IN ('video', 'slideshow')),
  slideshow_interval_ms INTEGER DEFAULT 3000,
  overlay_opacity INTEGER DEFAULT 50,
  background_color TEXT DEFAULT '#1a1a2e',
  background_fit TEXT DEFAULT 'cover' CHECK (background_fit IN ('fill', 'fit', 'stretch', 'tile', 'center', 'span')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homepage_hero_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  media_url TEXT NOT NULL,
  media_object_key TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_homepage_hero_media_is_active ON homepage_hero_media(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_hero_media_sort_order ON homepage_hero_media(sort_order);

-- ============================================
-- AGENCY SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS agency_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'StarMyriad',
  requirements JSONB DEFAULT '{}'::jsonb,
  benefits JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- UTILITY FUNCTIONS & TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto update_updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_talent_profiles_updated_at ON talent_profiles;
CREATE TRIGGER update_talent_profiles_updated_at BEFORE UPDATE ON talent_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artist_profiles_updated_at ON artist_profiles;
CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_art_images_updated_at ON portfolio_art_images;
CREATE TRIGGER update_portfolio_art_images_updated_at BEFORE UPDATE ON portfolio_art_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_art_updated_at ON portfolio_art;
CREATE TRIGGER update_portfolio_art_updated_at BEFORE UPDATE ON portfolio_art
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_media_updated_at ON gallery_media;
CREATE TRIGGER update_gallery_media_updated_at BEFORE UPDATE ON gallery_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commission_requests_updated_at ON commission_requests;
CREATE TRIGGER update_commission_requests_updated_at BEFORE UPDATE ON commission_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_merchandise_updated_at ON merchandise;
CREATE TRIGGER update_merchandise_updated_at BEFORE UPDATE ON merchandise
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_homepage_hero_settings_updated_at ON homepage_hero_settings;
CREATE TRIGGER update_homepage_hero_settings_updated_at BEFORE UPDATE ON homepage_hero_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_homepage_hero_media_updated_at ON homepage_hero_media;
CREATE TRIGGER update_homepage_hero_media_updated_at BEFORE UPDATE ON homepage_hero_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_settings_updated_at ON agency_settings;
CREATE TRIGGER update_agency_settings_updated_at BEFORE UPDATE ON agency_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIALIZATION COMPLETE
-- ============================================
