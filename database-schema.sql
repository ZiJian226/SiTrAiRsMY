-- StarMy Database Schema with Row Level Security (RLS)
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('talent', 'artist', 'admin')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TALENT PROFILES TABLE
-- ============================================
CREATE TABLE talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  character_description TEXT,
  debut_date DATE,
  social_links JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for talent_profiles
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published talent profiles
CREATE POLICY "Published talent profiles are viewable"
  ON talent_profiles FOR SELECT
  USING (is_published = true);

-- Talent/Artist can view their own unpublished profiles
CREATE POLICY "Users can view own talent profiles"
  ON talent_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Talent/Artist can insert their own profiles
CREATE POLICY "Users can insert own talent profiles"
  ON talent_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Talent/Artist can update their own profiles
CREATE POLICY "Users can update own talent profiles"
  ON talent_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all talent profiles
CREATE POLICY "Admins can view all talent profiles"
  ON talent_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any talent profile
CREATE POLICY "Admins can update any talent profile"
  ON talent_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete any talent profile
CREATE POLICY "Admins can delete any talent profile"
  ON talent_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
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
  category TEXT NOT NULL,
  talent_id UUID REFERENCES talent_profiles(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for merchandise
ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;

-- Anyone can view published merchandise
CREATE POLICY "Published merchandise is viewable"
  ON merchandise FOR SELECT
  USING (is_published = true);

-- Talent/Artist can view their own unpublished merchandise
CREATE POLICY "Users can view own merchandise"
  ON merchandise FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM talent_profiles
      WHERE id = talent_id AND user_id = auth.uid()
    )
  );

-- Talent/Artist can insert their own merchandise
CREATE POLICY "Users can insert own merchandise"
  ON merchandise FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM talent_profiles
      WHERE id = talent_id AND user_id = auth.uid()
    )
  );

-- Talent/Artist can update their own merchandise
CREATE POLICY "Users can update own merchandise"
  ON merchandise FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM talent_profiles
      WHERE id = talent_id AND user_id = auth.uid()
    )
  );

-- Admins can do everything with merchandise
CREATE POLICY "Admins can view all merchandise"
  ON merchandise FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert any merchandise"
  ON merchandise FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update any merchandise"
  ON merchandise FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any merchandise"
  ON merchandise FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
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
  category TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view published events
CREATE POLICY "Published events are viewable"
  ON events FOR SELECT
  USING (is_published = true);

-- Admins can do everything with events
CREATE POLICY "Admins can view all events"
  ON events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update any event"
  ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any event"
  ON events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- GALLERY ITEMS TABLE
-- ============================================
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  category TEXT NOT NULL,
  artist_name TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies for gallery_items
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view published gallery items
CREATE POLICY "Published gallery items are viewable"
  ON gallery_items FOR SELECT
  USING (is_published = true);

-- Admins can do everything with gallery items
CREATE POLICY "Admins can view all gallery items"
  ON gallery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert gallery items"
  ON gallery_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update any gallery item"
  ON gallery_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any gallery item"
  ON gallery_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
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

CREATE TRIGGER update_merchandise_updated_at BEFORE UPDATE ON merchandise
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_items_updated_at BEFORE UPDATE ON gallery_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_talent_profiles_user_id ON talent_profiles(user_id);
CREATE INDEX idx_talent_profiles_published ON talent_profiles(is_published);
CREATE INDEX idx_merchandise_talent_id ON merchandise(talent_id);
CREATE INDEX idx_merchandise_published ON merchandise(is_published);
CREATE INDEX idx_events_published ON events(is_published);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_gallery_items_published ON gallery_items(is_published);
CREATE INDEX idx_gallery_items_category ON gallery_items(category);
