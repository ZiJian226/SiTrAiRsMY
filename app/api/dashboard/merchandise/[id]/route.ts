import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/apiAuth'
import { logUserAuditEvent } from '@/lib/auditLog'
import { dbQuery } from '@/lib/database'
import {
  getUserMerchandiseById,
  updateUserMerchandise,
  deleteUserMerchandise
} from '@/lib/user/repository'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const item = await getUserMerchandiseById(user.id, id)

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching merchandise:', error)
    return NextResponse.json({ error: 'Failed to fetch merchandise' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const profileResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id])
    const actorRole = profileResult.rows[0]?.role as 'talent' | 'artist' | 'admin' | undefined

    // Convert numeric strings to numbers for price/stock
    const updateData: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (key === 'price' && value !== undefined) {
        updateData[key] = parseFloat(String(value))
      } else if (key === 'stock' && value !== undefined) {
        updateData[key] = parseInt(String(value))
      } else {
        updateData[key] = value
      }
    }

    const item = await updateUserMerchandise(user.id, id, updateData)

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole,
      action: 'merchandise.update',
      resourceType: 'merchandise',
      resourceId: item.id,
      targetUserId: user.id,
      metadata: {
        updatedFields: Object.keys(body || {}),
        name: item.name,
        category: item.category,
        is_published: item.is_published,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating merchandise:', error)
    return NextResponse.json({ error: 'Failed to update merchandise' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const profileResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id])
    const actorRole = profileResult.rows[0]?.role as 'talent' | 'artist' | 'admin' | undefined
    const existing = await getUserMerchandiseById(user.id, id)

    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await deleteUserMerchandise(user.id, id)

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole,
      action: 'merchandise.delete',
      resourceType: 'merchandise',
      resourceId: id,
      targetUserId: user.id,
      metadata: {
        name: existing.name,
        category: existing.category,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting merchandise:', error)
    return NextResponse.json({ error: 'Failed to delete merchandise' }, { status: 500 })
  }
}
