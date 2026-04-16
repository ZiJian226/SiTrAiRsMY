import { NextResponse } from 'next/server';
import { getStoreItems } from '@/lib/content/repository';

export const runtime = 'nodejs';

export async function GET() {
  const items = await getStoreItems();

  return NextResponse.json(items, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  });
}
