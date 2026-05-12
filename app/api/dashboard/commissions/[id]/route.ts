import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/apiAuth';
import { getCommissionRequestByIdForArtist, updateCommissionRequestStatusForArtist } from '@/lib/commissions/repository';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { action?: 'accepted' | 'rejected' };

    if (body.action !== 'accepted' && body.action !== 'rejected') {
      return NextResponse.json({ error: 'action must be accepted or rejected' }, { status: 400 });
    }

    const current = await getCommissionRequestByIdForArtist(user.id, id);
    if (!current) {
      return NextResponse.json({ error: 'Commission request not found' }, { status: 404 });
    }

    const updated = await updateCommissionRequestStatusForArtist(user.id, id, body.action);
    if (!updated) {
      return NextResponse.json({ error: 'Commission request could not be updated' }, { status: 409 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update commission request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
