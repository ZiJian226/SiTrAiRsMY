import { NextResponse } from 'next/server';
import { getTalentById } from '@/lib/content/repository';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const talent = await getTalentById(id);

  if (!talent) {
    return NextResponse.json({ message: 'Talent not found' }, { status: 404 });
  }

  return NextResponse.json(talent, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
