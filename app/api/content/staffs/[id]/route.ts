import { NextResponse } from 'next/server';
import { getStaffById } from '@/lib/content/repository';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaffById(id);

  if (!staff || staff.role !== 'staff') {
    return NextResponse.json({ message: 'Staff not found' }, { status: 404 });
  }

  return NextResponse.json(staff, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
