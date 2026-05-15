import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbQuery } from '@/lib/database';
import type { AuthSession, UserRole } from '@/lib/auth/types';
import { AUTH_SESSION_COOKIE_NAME, AUTH_SESSION_DURATION_SECONDS, hashSessionToken } from '@/lib/auth/session';
import { ensureAuditLogTable, getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';

export const runtime = 'nodejs';

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email = body.email?.trim();
  const password = body.password;
  const auditContext = getAuditRequestContext(request.headers);

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    await ensureAuditLogTable();

    const result = await dbQuery(
      `
      SELECT
        u.id AS user_id,
        u.email,
        p.id AS profile_id,
        p.full_name,
        p.role,
        p.avatar_url,
        p.bio,
        p.created_at,
        p.updated_at
      FROM users u
      INNER JOIN profiles p ON p.user_id = u.id
      WHERE
        LOWER(u.email) = LOWER($1)
        AND u.is_active = true
        AND u.password_hash = crypt($2, u.password_hash)
      LIMIT 1
      `,
      [email, password],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const row = result.rows[0] as {
      user_id: string;
      email: string;
      profile_id: string;
      full_name: string | null;
      role: UserRole;
      avatar_url: string | null;
      bio: string | null;
      created_at: string;
      updated_at: string;
    };

    const session: AuthSession = {
      user: {
        id: row.user_id,
        email: row.email,
      },
      profile: {
        id: row.profile_id,
        email: row.email,
        full_name: row.full_name,
        role: row.role,
        avatar_url: row.avatar_url,
        bio: row.bio,
        created_at: row.created_at,
        updated_at: row.updated_at,
      },
    };

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionInsert = await dbQuery(
      `
      INSERT INTO auth_sessions (
        user_id,
        token_hash,
        expires_at,
        last_seen_at,
        last_seen_ip_address,
        last_seen_country,
        last_seen_user_agent
      )
      VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 second'), NOW(), $4, $5, $6)
      RETURNING id
      `,
      [
        row.user_id,
        hashSessionToken(sessionToken),
        AUTH_SESSION_DURATION_SECONDS,
        auditContext.ipAddress,
        auditContext.locationCountry,
        auditContext.userAgent,
      ],
    );

    const sessionId = sessionInsert.rows[0]?.id as string | undefined;

    await logUserAuditEvent({
      actorUserId: row.user_id,
      actorRole: row.role,
      action: 'auth.login',
      category: 'auth',
      eventType: 'login',
      resourceType: 'session',
      resourceId: sessionId,
      entityType: 'user',
      entityId: row.user_id,
      targetUserId: row.user_id,
      sessionId,
      metadata: {
        email: row.email,
      },
      ...auditContext,
    });

    const response = NextResponse.json({ error: null, session });
    response.cookies.set(AUTH_SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: AUTH_SESSION_DURATION_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Database unavailable. Ensure local PostgreSQL is running and seeded.' },
      { status: 503 },
    );
  }
}
