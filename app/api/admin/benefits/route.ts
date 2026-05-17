import { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/apiAuth';
import { dbQuery } from '@/lib/database';
import { getAuditRequestContext, logUserAuditEvent } from '@/lib/auditLog';
import {
  getAgencyBenefits,
  createAgencyBenefit,
  updateAgencyBenefit,
  deleteAgencyBenefit,
  reorderAgencyBenefits,
} from '@/lib/admin/agencyRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const benefits = await getAgencyBenefits(category || undefined);

    return Response.json({
      success: true,
      data: benefits,
    });
  } catch (error) {
    console.error('Error fetching agency benefits:', error);
    return Response.json(
      { error: 'Failed to fetch benefits' },
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
    const { category, title, description, emoji, order } = body;

    if (!category || !title || !description) {
      return Response.json(
        { error: 'Missing required fields: category, title, description' },
        { status: 400 }
      );
    }

    const benefit = await createAgencyBenefit(category, title, description, emoji, order);

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole: userRole,
      action: 'benefit.created',
      category: 'content',
      eventType: 'create',
      resourceType: 'agency_benefits',
      resourceId: benefit.id,
      entityType: 'agency_benefit',
      entityId: benefit.id,
      metadata: {
        category,
        title,
      },
      ...auditContext,
    });

    return Response.json({
      success: true,
      data: benefit,
    });
  } catch (error) {
    console.error('Error creating agency benefit:', error);
    return Response.json(
      { error: 'Failed to create benefit' },
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

    const updated = await updateAgencyBenefit(id, {
      title,
      description,
      emoji,
      order,
      is_active,
    });

    if (!updated) {
      return Response.json({ error: 'Benefit not found' }, { status: 404 });
    }

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole: userRole,
      action: 'benefit.updated',
      category: 'content',
      eventType: 'update',
      resourceType: 'agency_benefits',
      resourceId: id,
      entityType: 'agency_benefit',
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
    console.error('Error updating agency benefit:', error);
    return Response.json(
      { error: 'Failed to update benefit' },
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

    const deleted = await deleteAgencyBenefit(id);

    if (!deleted) {
      return Response.json({ error: 'Benefit not found' }, { status: 404 });
    }

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole: userRole,
      action: 'benefit.deleted',
      category: 'content',
      eventType: 'delete',
      resourceType: 'agency_benefits',
      resourceId: id,
      entityType: 'agency_benefit',
      entityId: id,
      ...auditContext,
    });

    return Response.json({
      success: true,
      message: 'Benefit deleted',
    });
  } catch (error) {
    console.error('Error deleting agency benefit:', error);
    return Response.json(
      { error: 'Failed to delete benefit' },
      { status: 500 }
    );
  }
}
