import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/apiAuth';
import { dbQuery } from '@/lib/database';

export async function requireAdminUser(request: NextRequest): Promise<
  | { user: { id: string; email: string } }
  | { response: NextResponse }
> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const roleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id]);

  if (roleResult.rows[0]?.role !== 'admin') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user };
}