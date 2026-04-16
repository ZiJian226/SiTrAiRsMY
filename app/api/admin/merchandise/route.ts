import { NextRequest, NextResponse } from 'next/server';
import { createAdminMerchandise, getAdminMerchandise } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const items = await getAdminMerchandise();
    return NextResponse.json(items, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load merchandise';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      stock?: number;
      image_url?: string;
      image_object_key?: string;
      talent_name?: string;
      is_published?: boolean;
    };

    if (!body.name || typeof body.price !== 'number') {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
    }

    const created = await createAdminMerchandise({
      name: body.name,
      description: body.description || '',
      price: body.price,
      category: body.category || 'other',
      stock: body.stock ?? 0,
      image_url: body.image_url || '',
      image_object_key: body.image_object_key,
      talent_name: body.talent_name || 'StarMy',
      is_published: Boolean(body.is_published),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create merchandise';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
