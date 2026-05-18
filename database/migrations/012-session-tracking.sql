-- Add session_id to user_audit_logs for tracking active sessions
ALTER TABLE user_audit_logs ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE user_audit_logs ADD CONSTRAINT fk_session_id FOREIGN KEY (session_id) REFERENCES auth_sessions(id) ON DELETE SET NULL;

-- Create index for faster session-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON user_audit_logs(session_id);