import { createCareerApplication } from '@/lib/applications/repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, position, motivation, portfolioUrl, tiktokUsername } = body;

    if (!name || !email || !position || !motivation) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const application = await createCareerApplication(
      name,
      email,
      position,
      motivation,
      portfolioUrl,
      tiktokUsername
    );

    return Response.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error submitting career application:', error);
    return Response.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
