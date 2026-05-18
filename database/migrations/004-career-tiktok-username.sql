-- Add optional TikTok username to career applications
ALTER TABLE IF EXISTS career_applications
ADD COLUMN IF NOT EXISTS tiktok_username TEXT;