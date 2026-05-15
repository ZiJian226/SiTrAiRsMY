-- Add optional profile card / link hub URL to talent profiles
ALTER TABLE IF EXISTS talent_profiles
ADD COLUMN IF NOT EXISTS profile_card_url TEXT;