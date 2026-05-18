import { NextRequest, NextResponse } from 'next/server';
import { revokeSessionByTokenHash, getSessionByTokenHash } from '@/lib/auth/sessionService';
import { AUTH_SESSION_COOKIE_NAME, hashSessionToken } from '@/lib/auth/session';
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';

export const runtime = 'nodejs';

/**
 * Terminate a session when user closes the tab/browser
 * Only triggered on beforeunload/pagehide (not on tab blur/minimize)
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const tokenHash = hashSessionToken(sessionToken);
    // Retrieve session row for audit logging (if exists)
    const sessionRow = await getSessionByTokenHash(tokenHash);
    const revoked = await revokeSessionByTokenHash(tokenHash);

    // Log audit event for session termination (tab-close)
    try {
      const auditContext = getAuditRequestContext(request.headers);
      if (sessionRow?.id && sessionRow?.user_id) {
        await logUserAuditEvent({
          actorUserId: sessionRow.user_id,
          actorRole: undefined,
          action: 'auth.session.terminate',
          category: 'auth',
          eventType: 'session_terminate',
          resourceType: 'session',
          resourceId: sessionRow.id,
          entityType: 'user',
          entityId: sessionRow.user_id,
          targetUserId: sessionRow.user_id,
          sessionId: sessionRow.id,
          metadata: { reason: 'tab_close' },
          ...auditContext,
        });
      }
    } catch (err) {
      console.error('Failed to log session termination audit event:', err);
    }

    const response = NextResponse.json({ ok: revoked });
    
    // Clear the cookie
    response.cookies.set(AUTH_SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Session termination error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
