import { NextRequest, NextResponse } from 'next/server';
import { createAdminGalleryItem, getAdminGalleryItems } from '@/lib/admin/repository';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const items = await getAdminGalleryItems();
    return NextResponse.json(items, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load gallery items';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      title?: string;
      image_url?: string;
      image_object_key?: string;
      description?: string;
      category?: string;
      artist_name?: string;
      is_published?: boolean;
      featured?: boolean;
      media?: Array<{
        media_type: 'photo' | 'video';
        media_url: string;
        media_object_key?: string;
        thumbnail_url?: string;
        is_primary?: boolean;
        sort_order?: number;
      }>;
    };

    if (!body.title || !body.image_url) {
      return NextResponse.json({ error: 'title and image_url are required' }, { status: 400 });
    }

    const created = await createAdminGalleryItem({
      title: body.title,
      image_url: body.image_url,
      image_object_key: body.image_object_key,
      description: body.description || '',
      category: body.category || 'other',
      artist_name: body.artist_name || 'Unknown Artist',
      is_published: Boolean(body.is_published),
      featured: Boolean(body.featured),
      media: body.media?.map((item, index) => ({
        id: '',
        gallery_item_id: '',
        media_type: item.media_type,
        media_url: item.media_url,
        media_object_key: item.media_object_key,
        thumbnail_url: item.thumbnail_url,
        is_primary: Boolean(item.is_primary),
        sort_order: Number.isFinite(item.sort_order) ? Number(item.sort_order) : index,
      })),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create gallery item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
