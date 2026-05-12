-- Master PostgreSQL Init Script for StarMy
-- Consolidated seed and initialization script
-- Runs automatically on Docker container initialization

-- ============================================
-- SEED DATA FOR DEVELOPMENT
-- ============================================

INSERT INTO users (email, password_hash, is_active)
VALUES
  ('admin@starmy.com', crypt('admin123', gen_salt('bf')), true),
  ('talent@starmy.com', crypt('talent123', gen_salt('bf')), true),
  ('artist@starmy.com', crypt('artist123', gen_salt('bf')), true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (user_id, email, full_name, role, avatar_url, bio)
VALUES
  (
    (SELECT id FROM users WHERE email = 'admin@starmy.com'),
    'admin@starmy.com',
    'Admin User',
    'admin',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    'System administrator'
  ),
  (
    (SELECT id FROM users WHERE email = 'talent@starmy.com'),
    'talent@starmy.com',
    'Sakura Hoshino',
    'talent',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=talent',
    'Virtual talent and content creator'
  ),
  (
    (SELECT id FROM users WHERE email = 'artist@starmy.com'),
    'artist@starmy.com',
    'Luna Artworks',
    'artist',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=artist',
    'Digital artist and illustrator'
  )
ON CONFLICT (email) DO NOTHING;

INSERT INTO talent_profiles (user_id, stage_name, character_description, social_links, tags, is_published)
VALUES
  (
    (SELECT id FROM users WHERE email = 'talent@starmy.com'),
    'Sakura Hoshino',
    'Gaming and singing VTuber with cozy streams.',
    '{"youtubeUrl": "https://youtube.com/@sakurahoshino", "twitchUrl": "https://twitch.tv/sakurahoshino", "tiktokUrl": "https://tiktok.com/@sakurahoshino"}'::jsonb,
    ARRAY['Gaming', 'Singing', 'Cozy'],
    true
  )
ON CONFLICT DO NOTHING;

-- Create artist profile for the artist user
INSERT INTO artist_profiles (user_id, specialty, portfolio_links, social_media_links, featured, is_published)
SELECT p.user_id, '{}'::text[], '{}'::text[], '{}'::jsonb, false, true
FROM profiles p
LEFT JOIN artist_profiles ap ON ap.user_id = p.user_id
WHERE p.role = 'artist' AND ap.user_id IS NULL
ON CONFLICT DO NOTHING;

-- ============================================
-- OBJECT STORAGE KEY SETUP
-- ============================================

-- Ensure profiles have object storage keys tracked
-- No inserts needed, columns are created during schema migration

-- ============================================
-- PASSWORD RESET SYSTEM TABLES
-- ============================================

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
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_used_at ON password_reset_tokens(used_at);

-- ============================================
-- USER AUDIT LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_audit_logs (
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

CREATE INDEX IF NOT EXISTS idx_user_audit_logs_actor_user_id ON user_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_target_user_id ON user_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_action ON user_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON user_audit_logs(created_at DESC);

-- ============================================
-- INITIALIZATION COMPLETE
-- ============================================
