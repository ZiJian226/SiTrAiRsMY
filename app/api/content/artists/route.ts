import { NextResponse } from 'next/server';
import { getArtists } from '@/lib/content/repository';

export const runtime = 'nodejs';

export async function GET() {
  const artists = await getArtists();

  return NextResponse.json(artists, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
