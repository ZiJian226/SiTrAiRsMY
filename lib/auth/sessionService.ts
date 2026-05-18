import 'server-only';
import { dbQuery } from '@/lib/database';

export interface AuthSessionRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  last_seen_at: string | null;
  last_seen_ip_address: string | null;
  last_seen_country: string | null;
  last_seen_user_agent: string | null;
  created_at: string;
}

/**
 * Create a new session in the database
 */
export async function createSession(
  userId: string,
  tokenHash: string,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthSessionRecord | null> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const result = await dbQuery(
    `INSERT INTO auth_sessions (user_id, token_hash, expires_at, last_seen_at, last_seen_ip_address, last_seen_user_agent)
     VALUES ($1, $2, $3, NOW(), $4, $5)
     RETURNING id, user_id, token_hash, expires_at, revoked_at, last_seen_at, last_seen_ip_address, last_seen_country, last_seen_user_agent, created_at`,
    [userId, tokenHash, expiresAt, ipAddress || null, userAgent || null]
  );
  return (result.rows[0] as AuthSessionRecord) || null;
}

/**
 * Get session by token hash
 */
export async function getSessionByTokenHash(tokenHash: string): Promise<AuthSessionRecord | null> {
  const result = await dbQuery(
    `SELECT id, user_id, token_hash, expires_at, revoked_at, last_seen_at, last_seen_ip_address, last_seen_country, last_seen_user_agent, created_at
     FROM auth_sessions
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );
  return (result.rows[0] as AuthSessionRecord) || null;
}

/**
 * Get all active sessions for a user
 */
export async function getUserActiveSessions(userId: string): Promise<AuthSessionRecord[]> {
  const result = await dbQuery(
    `SELECT id, user_id, token_hash, expires_at, revoked_at, last_seen_at, last_seen_ip_address, last_seen_country, last_seen_user_agent, created_at
     FROM auth_sessions
     WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
     ORDER BY last_seen_at DESC NULLS LAST`,
    [userId]
  );
  return (result.rows as AuthSessionRecord[]) || [];
}

/**
 * Update last seen timestamp for a session
 */
export async function updateSessionLastSeen(
  sessionId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<boolean> {
  const result = await dbQuery(
    `UPDATE auth_sessions
     SET last_seen_at = NOW()${ipAddress ? ', last_seen_ip_address = $2' : ''}${userAgent ? ', last_seen_user_agent = $3' : ''}
     WHERE id = $1 AND revoked_at IS NULL
     RETURNING id`,
    [sessionId, ...(ipAddress ? [ipAddress] : []), ...(userAgent ? [userAgent] : [])]
  );
  return (result.rowCount || 0) > 0;
}

/**
 * Revoke a single session
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
  const result = await dbQuery(
    `UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1 RETURNING id`,
    [sessionId]
  );
  return (result.rowCount || 0) > 0;
}

/**
 * Revoke session by token hash
 */
export async function revokeSessionByTokenHash(tokenHash: string): Promise<boolean> {
  const result = await dbQuery(
    `UPDATE auth_sessions SET revoked_at = NOW() WHERE token_hash = $1 RETURNING id`,
    [tokenHash]
  );
  return (result.rowCount || 0) > 0;
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await dbQuery(
    `UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL RETURNING id`,
    [userId]
  );
  return result.rowCount || 0;
}

/**
 * Clean up inactive sessions server-side
 * Revokes sessions that haven't been seen in X minutes (inactivity timeout)
 */
export async function cleanupInactiveSessions(inactivityMinutes: number = 40): Promise<number> {
  const inactivityThreshold = new Date(Date.now() - inactivityMinutes * 60 * 1000);
  
  const result = await dbQuery(
    `UPDATE auth_sessions
     SET revoked_at = NOW()
     WHERE revoked_at IS NULL
       AND (last_seen_at IS NULL OR last_seen_at < $1)
       AND expires_at > NOW()
     RETURNING id`,
    [inactivityThreshold.toISOString()]
  );
  
  return result.rowCount || 0;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await dbQuery(
    `DELETE FROM auth_sessions WHERE expires_at <= NOW() RETURNING id`
  );
  return result.rowCount || 0;
}

/**
 * Get active session count for a user
 */
export async function getUserActiveSessionCount(userId: string): Promise<number> {
  const result = await dbQuery(
    `SELECT COUNT(*)::int AS count
     FROM auth_sessions
     WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
    [userId]
  );
  return (result.rows[0]?.count as number) || 0;
}

/**
 * Get total active sessions across all users
 */
export async function getTotalActiveSessions(): Promise<number> {
  const result = await dbQuery(
    `SELECT COUNT(*)::int AS count
     FROM auth_sessions
     WHERE revoked_at IS NULL AND expires_at > NOW()`
  );
  return (result.rows[0]?.count as number) || 0;
}
