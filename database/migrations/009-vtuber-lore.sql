-- Migration 009: Add vtuber lore / model description for talent & staff profiles

ALTER TABLE IF EXISTS talent_profiles
  ADD COLUMN IF NOT EXISTS vtuber_lore TEXT;