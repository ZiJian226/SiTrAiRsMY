import { NextRequest, NextResponse } from 'next/server';
import { createCommissionRequest } from '@/lib/commissions/repository';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      description?: string;
      budget?: string;
      deadline?: string;
    };

    if (!body.name || !body.email || !body.description || !body.budget) {
      return NextResponse.json({ error: 'name, email, description, and budget are required' }, { status: 400 });
    }

    const requestRecord = await createCommissionRequest({
      artistProfileId: id,
      clientName: body.name,
      clientEmail: body.email,
      description: body.description,
      budget: body.budget,
      deadline: body.deadline || null,
    });

    return NextResponse.json({ success: true, data: requestRecord }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit commission request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
