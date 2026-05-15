import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { AUTH_SESSION_COOKIE_NAME, hashSessionToken } from '@/lib/auth/session';
import { getAuditRequestContext } from '@/lib/auditLog';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const auditContext = getAuditRequestContext(request.headers);

  const result = await dbQuery(
    `
    UPDATE auth_sessions
    SET
      last_seen_at = NOW(),
      last_seen_ip_address = $2,
      last_seen_country = $3,
      last_seen_user_agent = $4
    WHERE token_hash = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
    RETURNING id
    `,
    [
      hashSessionToken(sessionToken),
      auditContext.ipAddress,
      auditContext.locationCountry,
      auditContext.userAgent,
    ],
  ).catch(() => null);

  if (!result || result.rowCount === 0) {
    const response = NextResponse.json({ ok: false }, { status: 401 });
    response.cookies.set(AUTH_SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.json({ ok: true });
}
