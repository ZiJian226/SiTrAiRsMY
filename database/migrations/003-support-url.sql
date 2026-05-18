-- Add optional support link for talent/staff profiles

ALTER TABLE IF EXISTS talent_profiles
  ADD COLUMN IF NOT EXISTS support_url TEXT;