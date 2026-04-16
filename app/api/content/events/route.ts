import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/content/repository';

export const runtime = 'nodejs';

export async function GET() {
  const events = await getEvents();

  return NextResponse.json(events, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
