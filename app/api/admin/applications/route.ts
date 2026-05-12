import { getAdminApplications, updateApplication } from '@/lib/admin/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'career' | 'community' | null;

    const applications = await getAdminApplications(type || undefined);

    return Response.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return Response.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, type, status, adminNotes } = body;

    if (!id || !type || !status) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updated = await updateApplication(id, type, status, adminNotes);

    if (!updated) {
      return Response.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return Response.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
