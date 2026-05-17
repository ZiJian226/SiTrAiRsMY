-- Migration 007: Add agency requirements and benefits tables
-- Also rename community_applications to agency_applications

-- 1. Create agency_requirements table
CREATE TABLE IF NOT EXISTS agency_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL, -- 'general', 'artist', 'talent'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create agency_benefits table
CREATE TABLE IF NOT EXISTS agency_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'identity', 'connection', 'guidance', 'freedom', 'promotion', 'opportunities', 'safety', 'experience'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Rename community_applications to agency_applications (with data migration)
-- First, create the new table
CREATE TABLE IF NOT EXISTS agency_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT,
  discord_name TEXT,
  is_malaysian BOOLEAN,
  supporting_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewing, accepted, rejected
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Copy data from old table if it exists
INSERT INTO agency_applications (id, name, email, country, discord_name, is_malaysian, supporting_info, status, admin_notes, created_at, updated_at)
SELECT id, name, email, country, discord_name, is_malaysian, supporting_info, status, admin_notes, created_at, updated_at
FROM community_applications
ON CONFLICT DO NOTHING;

-- Drop old table
DROP TABLE IF EXISTS community_applications CASCADE;

-- Create indexes for better query performance
CREATE INDEX idx_agency_requirements_role ON agency_requirements(role);
CREATE INDEX idx_agency_requirements_is_active ON agency_requirements(is_active);
CREATE INDEX idx_agency_benefits_category ON agency_benefits(category);
CREATE INDEX idx_agency_benefits_is_active ON agency_benefits(is_active);
CREATE INDEX idx_agency_applications_status ON agency_applications(status);
CREATE INDEX idx_agency_applications_email ON agency_applications(email);
