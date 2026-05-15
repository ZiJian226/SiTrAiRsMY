import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/apiAuth';
import { dbQuery } from '@/lib/database';
import { getAdminProfiles } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id]);
    if (roleResult.rows[0]?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const profiles = await getAdminProfiles();
    return NextResponse.json(profiles, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load profiles';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
