-- StarMy Database Schema for self-hosted PostgreSQL (Oracle VM)
-- Run this SQL in your PostgreSQL instance

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
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

-- ============================================
-- TALENT PROFILES TABLE
-- ============================================
CREATE TABLE talent_profiles (
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
  support_url TEXT,
  featured_video_url TEXT,
  social_links JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ARTIST PROFILES TABLE
-- ============================================
CREATE TABLE artist_profiles (
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
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PORTFOLIO ART IMAGES TABLE
-- ============================================
CREATE TABLE portfolio_art_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_object_key TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MERCHANDISE TABLE
-- ============================================
CREATE TABLE merchandise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  image_object_key TEXT,
  category TEXT NOT NULL,
  talent_id UUID REFERENCES talent_profiles(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE events (
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

-- ============================================
-- GALLERY ITEMS TABLE
-- ============================================
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_object_key TEXT,
  thumbnail_url TEXT,
  description TEXT,
  category TEXT NOT NULL,
  artist_name TEXT,
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- GALLERY MEDIA TABLE
-- ============================================
CREATE TABLE gallery_media (
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

-- ============================================
-- CAREER APPLICATIONS TABLE
-- ============================================
CREATE TABLE career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  portfolio_url TEXT,
  motivation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COMMUNITY APPLICATIONS TABLE
-- ============================================
CREATE TABLE community_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Malaysia',
  discord_name TEXT,
  is_malaysian BOOLEAN NOT NULL DEFAULT true,
  supporting_info TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USER AUDIT LOGS TABLE
-- ============================================
CREATE TABLE user_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talent_profiles_updated_at BEFORE UPDATE ON talent_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_profiles_updated_at BEFORE UPDATE ON artist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_art_images_updated_at BEFORE UPDATE ON portfolio_art_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchandise_updated_at BEFORE UPDATE ON merchandise
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_items_updated_at BEFORE UPDATE ON gallery_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_media_updated_at BEFORE UPDATE ON gallery_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_talent_profiles_user_id ON talent_profiles(user_id);
CREATE UNIQUE INDEX idx_talent_profiles_user_id_unique ON talent_profiles(user_id);
CREATE INDEX idx_talent_profiles_published ON talent_profiles(is_published);
CREATE INDEX idx_talent_profiles_featured ON talent_profiles(featured);
CREATE INDEX idx_talent_profiles_portrait_pictures ON talent_profiles USING gin(portrait_pictures);
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX idx_artist_profiles_featured ON artist_profiles(featured);
CREATE INDEX idx_artist_profiles_portfolio_art_images ON artist_profiles USING gin(portfolio_art_images);
CREATE INDEX idx_portfolio_art_images_artist_id ON portfolio_art_images(artist_id);
CREATE INDEX idx_portfolio_art_images_sort_order ON portfolio_art_images(artist_id, sort_order);
CREATE INDEX idx_merchandise_talent_id ON merchandise(talent_id);
CREATE INDEX idx_merchandise_published ON merchandise(is_published);
CREATE INDEX idx_events_published ON events(is_published);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_gallery_items_published ON gallery_items(is_published);
CREATE INDEX idx_gallery_items_category ON gallery_items(category);
CREATE INDEX idx_gallery_media_gallery_item_id ON gallery_media(gallery_item_id);
CREATE INDEX idx_gallery_media_is_primary ON gallery_media(gallery_item_id, is_primary);
CREATE INDEX idx_gallery_media_sort_order ON gallery_media(gallery_item_id, sort_order);
CREATE INDEX idx_user_audit_logs_actor_user_id ON user_audit_logs(actor_user_id);
CREATE INDEX idx_user_audit_logs_target_user_id ON user_audit_logs(target_user_id);
CREATE INDEX idx_user_audit_logs_action ON user_audit_logs(action);
CREATE INDEX idx_user_audit_logs_created_at ON user_audit_logs(created_at DESC);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE UNIQUE INDEX idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX idx_users_email ON users(email);

CREATE INDEX idx_career_applications_status ON career_applications(status);
CREATE INDEX idx_career_applications_email ON career_applications(email);
CREATE INDEX idx_career_applications_created_at ON career_applications(created_at DESC);

CREATE INDEX idx_community_applications_status ON community_applications(status);
CREATE INDEX idx_community_applications_email ON community_applications(email);
CREATE INDEX idx_community_applications_created_at ON community_applications(created_at DESC);
CREATE INDEX idx_community_applications_is_malaysian ON community_applications(is_malaysian);
