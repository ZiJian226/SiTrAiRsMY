import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { requireAdminOrStaffUser } from '@/lib/auth/authorization';

export const runtime = 'nodejs';

type ContentHighlight = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_object_key: string | null;
  thumbnail_url: string | null;
  thumbnail_object_key: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * GET: Fetch all content highlights (including inactive) for admin
 */
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdminOrStaffUser(request);
    if ('response' in guard) return guard.response;

    const result = await dbQuery(
      `SELECT id, title, description, video_url, video_object_key, thumbnail_url, thumbnail_object_key, sort_order, is_active, created_at, updated_at
       FROM homepage_content_highlights
       ORDER BY sort_order ASC`,
    );

    const highlights = (result.rows as ContentHighlight[]) || [];

    return NextResponse.json(
      { success: true, data: highlights },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Failed to fetch content highlights for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch content highlights' }, { status: 500 });
  }
}

/**
 * POST: Create a new content highlight
 */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdminOrStaffUser(request);
    if ('response' in guard) return guard.response;

    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
      description?: string;
      video_url?: string;
      video_object_key?: string;
      thumbnail_url?: string;
      thumbnail_object_key?: string;
      sort_order?: number;
      is_active?: boolean;
    };

    const { title, description, video_url, video_object_key, thumbnail_url, thumbnail_object_key, sort_order = 0, is_active = true } = body;

    if (!title || !video_url) {
      return NextResponse.json({ error: 'Title and video_url are required' }, { status: 400 });
    }

    const result = await dbQuery(
      `INSERT INTO homepage_content_highlights (title, description, video_url, video_object_key, thumbnail_url, thumbnail_object_key, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, description, video_url, video_object_key, thumbnail_url, thumbnail_object_key, sort_order, is_active, created_at, updated_at`,
      [title, description || null, video_url, video_object_key || null, thumbnail_url || null, thumbnail_object_key || null, sort_order, is_active],
    );

    const highlight = (result.rows[0] as ContentHighlight) || null;

    return NextResponse.json({ success: true, data: highlight }, { status: 201 });
  } catch (error) {
    console.error('Failed to create content highlight:', error);
    return NextResponse.json({ error: 'Failed to create content highlight' }, { status: 500 });
  }
}

/**
 * PUT: Update a content highlight
 */
export async function PUT(request: NextRequest) {
  try {
    const guard = await requireAdminOrStaffUser(request);
    if ('response' in guard) return guard.response;

    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      title?: string;
      description?: string;
      video_url?: string;
      video_object_key?: string;
      thumbnail_url?: string;
      thumbnail_object_key?: string;
      sort_order?: number;
      is_active?: boolean;
    };

    const { id, title, description, video_url, video_object_key, thumbnail_url, thumbnail_object_key, sort_order, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: unknown[] = [id];
    let paramIndex = 2;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }
    if (video_url !== undefined) {
      updates.push(`video_url = $${paramIndex}`);
      values.push(video_url);
      paramIndex++;
    }
    if (video_object_key !== undefined) {
      updates.push(`video_object_key = $${paramIndex}`);
      values.push(video_object_key);
      paramIndex++;
    }
    if (thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = $${paramIndex}`);
      values.push(thumbnail_url);
      paramIndex++;
    }
    if (thumbnail_object_key !== undefined) {
      updates.push(`thumbnail_object_key = $${paramIndex}`);
      values.push(thumbnail_object_key);
      paramIndex++;
    }
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramIndex}`);
      values.push(sort_order);
      paramIndex++;
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(is_active);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const result = await dbQuery(
      `UPDATE homepage_content_highlights
       SET ${updates.join(', ')}
       WHERE id = $1
       RETURNING id, title, description, video_url, video_object_key, thumbnail_url, thumbnail_object_key, sort_order, is_active, created_at, updated_at`,
      values,
    );

    const highlight = (result.rows[0] as ContentHighlight) || null;

    if (!highlight) {
      return NextResponse.json({ error: 'Content highlight not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: highlight });
  } catch (error) {
    console.error('Failed to update content highlight:', error);
    return NextResponse.json({ error: 'Failed to update content highlight' }, { status: 500 });
  }
}

/**
 * DELETE: Delete a content highlight
 */
export async function DELETE(request: NextRequest) {
  try {
    const guard = await requireAdminOrStaffUser(request);
    if ('response' in guard) return guard.response;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await dbQuery(
      `DELETE FROM homepage_content_highlights WHERE id = $1 RETURNING id`,
      [id],
    );

    if ((result.rowCount || 0) === 0) {
      return NextResponse.json({ error: 'Content highlight not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Content highlight deleted' });
  } catch (error) {
    console.error('Failed to delete content highlight:', error);
    return NextResponse.json({ error: 'Failed to delete content highlight' }, { status: 500 });
  }
}
