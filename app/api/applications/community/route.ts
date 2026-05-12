import { createCommunityApplication } from '@/lib/applications/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, discordName, supportingInfo, isMalaysian, email, country } = body;

    if (!name || !discordName || !supportingInfo) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isMalaysian) {
      return Response.json({ error: 'Community applications are restricted to Malaysian applicants' }, { status: 400 });
    }

    const application = await createCommunityApplication(
      name,
      discordName,
      supportingInfo,
      true,
      email || null,
      country || 'Malaysia'
    );

    return Response.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error submitting community application:', error);
    return Response.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
