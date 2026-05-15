import { NextRequest, NextResponse } from 'next/server';
import { getAdminStatistics } from '@/lib/admin/repository';
import { requireAdminUser } from '@/lib/auth/authorization';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdminUser(request);
    if ('response' in guard) return guard.response;

    const stats = await getAdminStatistics();
    return NextResponse.json(stats, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load statistics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
