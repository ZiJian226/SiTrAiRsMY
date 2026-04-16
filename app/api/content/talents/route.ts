import { NextResponse } from 'next/server';
import { getTalents } from '@/lib/content/repository';

export const runtime = 'nodejs';

export async function GET() {
  const talents = await getTalents();

  return NextResponse.json(talents, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
