import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE_NAME, hashSessionToken } from '@/lib/auth/session';
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';
import { dbQuery as query } from '@/lib/database';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;
  const auditContext = getAuditRequestContext(request.headers);
  const reason = request.nextUrl.searchParams.get('reason') === 'timeout' ? 'timeout' : 'manual';

  if (sessionToken) {
    const result = await query(
      `
      UPDATE auth_sessions
      SET revoked_at = NOW()
      WHERE token_hash = $1
        AND revoked_at IS NULL
      RETURNING id, user_id
      `,
      [hashSessionToken(sessionToken)],
    ).catch(() => null);

    const sessionRow = result?.rows[0] as { id: string; user_id: string } | undefined;

    if (sessionRow?.user_id) {
      const roleResult = await query('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [sessionRow.user_id]).catch(() => null);
      const actorRole = roleResult?.rows[0]?.role as string | undefined;

      await logUserAuditEvent({
        actorUserId: sessionRow.user_id,
        actorRole,
        action: 'auth.logout',
        category: 'auth',
        eventType: 'logout',
        resourceType: 'session',
        resourceId: sessionRow.id,
        entityType: 'user',
        entityId: sessionRow.user_id,
        targetUserId: sessionRow.user_id,
        sessionId: sessionRow.id,
        metadata: {
          reason,
        },
        ...auditContext,
      });
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
