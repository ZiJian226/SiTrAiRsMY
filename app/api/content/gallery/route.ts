import { NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/content/repository';

export const runtime = 'nodejs';

export async function GET() {
  const items = await getGalleryItems();

  return NextResponse.json(items, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
