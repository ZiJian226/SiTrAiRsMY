import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await dbQuery(
      `SELECT p.id AS profile_id, p.user_id, tp.profile_picture_url, tp.profile_picture_object_key, tp.portrait_picture_url, tp.portrait_picture_object_key
       FROM profiles p
       LEFT JOIN talent_profiles tp ON tp.user_id = p.user_id
       WHERE p.id = $1
       LIMIT 1`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'unknown' }, { status: 500 });
  }
}
