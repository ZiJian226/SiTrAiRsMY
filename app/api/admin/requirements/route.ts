import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/apiAuth';
import { dbQuery } from '@/lib/database';
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';
import {
  getAgencyRequirements,
  createAgencyRequirement,
  updateAgencyRequirement,
  deleteAgencyRequirement,
  reorderAgencyRequirements,
} from '@/lib/admin/agencyRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const requirements = await getAgencyRequirements(role || undefined);

    return Response.json({
      success: true,
      data: requirements,
    });
  } catch (error) {
    console.error('Error fetching agency requirements:', error);
    return Response.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id]);
    const userRole = roleResult.rows[0]?.role as string | undefined;

    if (userRole !== 'admin' && userRole !== 'staff') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const auditContext = getAuditRequestContext(request.headers);
    const body = await request.json();
    const { role, title, description, emoji, order } = body;

    if (!role || !title || !description) {
      return Response.json(
        { error: 'Missing required fields: role, title, description' },
        { status: 400 }
      );
    }

    const requirement = await createAgencyRequirement(role, title, description, emoji, order);

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole: userRole,
      action: 'requirement.created',
      category: 'content',
      eventType: 'create',
      resourceType: 'agency_requirements',
      resourceId: requirement.id,
      entityType: 'agency_requirement',
      entityId: requirement.id,
      metadata: {
        role,
        title,
      },
      ...auditContext,
    });

    return Response.json({
      success: true,
      data: requirement,
    });
  } catch (error) {
    console.error('Error creating agency requirement:', error);
    return Response.json(
      { error: 'Failed to create requirement' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id]);
    const userRole = roleResult.rows[0]?.role as string | undefined;

    if (userRole !== 'admin' && userRole !== 'staff') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const auditContext = getAuditRequestContext(request.headers);
    const body = await request.json();
    const { id, title, description, emoji, order, is_active } = body;

    if (!id) {
      return Response.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const updated = await updateAgencyRequirement(id, {
      title,
      description,
      emoji,
      order,
      is_active,
    });

    if (!updated) {
      return Response.json({ error: 'Requirement not found' }, { status: 404 });
    }

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole: userRole,
      action: 'requirement.updated',
      category: 'content',
      eventType: 'update',
      resourceType: 'agency_requirements',
      resourceId: id,
      entityType: 'agency_requirement',
      entityId: id,
      metadata: {
        updated_fields: Object.keys(body).filter((k) => k !== 'id'),
      },
      ...auditContext,
    });

    return Response.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating agency requirement:', error);
    return Response.json(
      { error: 'Failed to update requirement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roleResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id]);
    const userRole = roleResult.rows[0]?.role as string | undefined;

    if (userRole !== 'admin' && userRole !== 'staff') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const auditContext = getAuditRequestContext(request.headers);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Missing required parameter: id' }, { status: 400 });
    }

    const deleted = await deleteAgencyRequirement(id);

    if (!deleted) {
      return Response.json({ error: 'Requirement not found' }, { status: 404 });
    }

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole: userRole,
      action: 'requirement.deleted',
      category: 'content',
      eventType: 'delete',
      resourceType: 'agency_requirements',
      resourceId: id,
      entityType: 'agency_requirement',
      entityId: id,
      ...auditContext,
    });

    return Response.json({
      success: true,
      message: 'Requirement deleted',
    });
  } catch (error) {
    console.error('Error deleting agency requirement:', error);
    return Response.json(
      { error: 'Failed to delete requirement' },
      { status: 500 }
    );
  }
}
