import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/apiAuth';
import { dbQuery } from '@/lib/database';

type AuthenticatedUser = { id: string; email: string };

async function getUserRole(userId: string): Promise<string | undefined> {
  const roleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [userId]);
  return roleResult.rows[0]?.role as string | undefined;
}

export async function requireAdminUser(request: NextRequest): Promise<
  | { user: AuthenticatedUser }
  | { response: NextResponse }
> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const role = await getUserRole(user.id);

  if (role !== 'admin') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user };
}

export async function requireAdminOrStaffUser(request: NextRequest): Promise<
  | { user: AuthenticatedUser; role: 'admin' | 'staff' }
  | { response: NextResponse }
> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const role = await getUserRole(user.id);

  if (role !== 'admin' && role !== 'staff') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user, role };
}