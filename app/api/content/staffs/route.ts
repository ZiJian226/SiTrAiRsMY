import { NextResponse } from 'next/server';
import { getStaffs } from '@/lib/content/repository';

export const runtime = 'nodejs';

export async function GET() {
  const staffs = await getStaffs();

  return NextResponse.json(staffs, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
