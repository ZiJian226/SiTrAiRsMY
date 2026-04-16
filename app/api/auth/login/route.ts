import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import type { AuthSession, UserRole } from '@/lib/auth/types';

export const runtime = 'nodejs';

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
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

    return NextResponse.json({ error: null, session });
  } catch {
    return NextResponse.json(
      { error: 'Database unavailable. Ensure local PostgreSQL is running and seeded.' },
      { status: 503 },
    );
  }
}
