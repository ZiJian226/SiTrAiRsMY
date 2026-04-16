import { NextResponse } from 'next/server';
import { getAdminStatistics } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const stats = await getAdminStatistics();
    return NextResponse.json(stats, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load statistics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
