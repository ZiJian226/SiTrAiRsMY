import { NextRequest } from 'next/server'
import { dbQuery } from '@/lib/database'
import { AUTH_SESSION_COOKIE_NAME, AUTH_SESSION_INACTIVITY_TIMEOUT_SECONDS, hashSessionToken } from '@/lib/auth/session'

export async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string; email: string } | null> {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  try {
    const sessionResult = await dbQuery(
      `
      SELECT s.id, s.user_id, s.revoked_at, s.expires_at, COALESCE(s.last_seen_at, s.created_at) AS last_activity_at
      FROM auth_sessions s
      WHERE s.token_hash = $1
      LIMIT 1
      `,
      [hashSessionToken(sessionToken)],
    )

    if (sessionResult.rows.length === 0) {
      return null
    }

    const sessionRow = sessionResult.rows[0] as {
      id: string
      user_id: string
      revoked_at: string | null
      expires_at: string
      last_activity_at: string
    }

    if (
      sessionRow.revoked_at ||
      new Date(sessionRow.expires_at).getTime() <= Date.now() ||
      Date.now() - new Date(sessionRow.last_activity_at).getTime() > AUTH_SESSION_INACTIVITY_TIMEOUT_SECONDS * 1000
    ) {
      await dbQuery('UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL', [sessionRow.id]).catch(() => undefined)
      return null
    }

    const result = await dbQuery(
      `
      UPDATE auth_sessions
      SET
        last_seen_at = NOW(),
        last_seen_ip_address = $1,
        last_seen_country = $2,
        last_seen_user_agent = $3
      WHERE id = $4
      RETURNING user_id
      `,
      [
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || null,
        request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || request.headers.get('x-country-code') || null,
        request.headers.get('user-agent') || null,
        sessionRow.id,
      ]
    )

    if (result.rowCount === 0) {
      return null
    }

    const userResult = await dbQuery(
      `
      SELECT u.id, u.email
      FROM users u
      WHERE u.id = $1
        AND u.is_active = true
      LIMIT 1
      `,
      [sessionRow.user_id],
    )

    if (userResult.rows.length === 0) {
      return null
    }

    return {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email
    }
  } catch {
    return null
  }
}
