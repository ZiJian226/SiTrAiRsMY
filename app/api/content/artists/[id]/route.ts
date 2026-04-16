import { NextResponse } from 'next/server';
import { getArtistById } from '@/lib/content/repository';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await getArtistById(id);

  if (!artist) {
    return NextResponse.json({ message: 'Artist not found' }, { status: 404 });
  }

  return NextResponse.json(artist, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
