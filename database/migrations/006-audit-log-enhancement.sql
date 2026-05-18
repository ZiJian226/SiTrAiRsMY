-- ============================================
-- AUDIT LOG ENHANCEMENT MIGRATION
-- ============================================

ALTER TABLE IF EXISTS auth_sessions
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_ip_address TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_country TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_user_agent TEXT;

ALTER TABLE IF EXISTS user_audit_logs
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'content',
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'activity',
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_id TEXT,
  ADD COLUMN IF NOT EXISTS page_key TEXT,
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES auth_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status_before TEXT,
  ADD COLUMN IF NOT EXISTS status_after TEXT,
  ADD COLUMN IF NOT EXISTS location_country TEXT;

CREATE INDEX IF NOT EXISTS idx_user_audit_logs_category ON user_audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_session_id ON user_audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_location_country ON user_audit_logs(location_country);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON user_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_last_seen_at ON auth_sessions(last_seen_at DESC);