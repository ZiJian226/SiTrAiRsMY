import { NextResponse } from 'next/server';
import { dbQuery, dbPool } from '@/lib/database';

export async function GET() {
  if (!dbPool) {
    return NextResponse.json({ ok: false, error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  try {
    const res = await dbQuery('SELECT 1 AS ok');
    const ok = res && res.rows && res.rows[0] && res.rows[0].ok === 1;
    return NextResponse.json({ ok: Boolean(ok) });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
