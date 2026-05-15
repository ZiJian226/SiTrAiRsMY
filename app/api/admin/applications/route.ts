import { getAdminApplications, updateApplication } from '@/lib/admin/repository';
import { NextRequest } from 'next/server';
import { requireAdminUser } from '@/lib/auth/authorization';
import { dbQuery } from '@/lib/database';
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';

export async function GET(request: Request) {
  try {
    const guard = await requireAdminUser(request as NextRequest);
    if ('response' in guard) return guard.response;

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
    const guard = await requireAdminUser(request as NextRequest);
    if ('response' in guard) return guard.response;
    const auditContext = getAuditRequestContext((request as NextRequest).headers);
    const body = await request.json();
    const { id, type, status, adminNotes } = body;

    if (!id || !type || !status) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const table = type === 'career' ? 'career_applications' : 'community_applications';
    const currentResult = await dbQuery(`SELECT status FROM ${table} WHERE id = $1 LIMIT 1`, [id]);
    const statusBefore = currentResult.rows[0]?.status as string | undefined;

    const updated = await updateApplication(id, type, status, adminNotes);

    if (!updated) {
      return Response.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    await logUserAuditEvent({
      actorUserId: guard.user.id,
      actorRole: 'admin',
      action: 'application.status_update',
      category: 'application',
      eventType: 'status-change',
      resourceType: table,
      resourceId: id,
      entityType: type === 'career' ? 'career_application' : 'community_application',
      entityId: id,
      statusBefore,
      statusAfter: status,
      metadata: {
        adminNotes: adminNotes || null,
        type,
      },
      ...auditContext,
    });

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
