import { NextResponse } from 'next/server';
import { createCommunityApplication } from '@/lib/applications/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, discordName, supportingInfo, isMalaysian, email, country } = body;

    if (!name || !email || !discordName || !supportingInfo) {
      return NextResponse.json({ error: 'name, email, discordName, and supportingInfo are required' }, { status: 400 })
    }

    if (!isMalaysian) {
      return Response.json({ error: 'Community applications are restricted to Malaysian applicants' }, { status: 400 });
    }

    const application = await createCommunityApplication(
      name,
      email,
      discordName,
      supportingInfo,
      isMalaysian,
      country || 'Malaysia'
    );

    return Response.json({
      success: true,
      data: application,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
    console.error('Error submitting community application:', error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
