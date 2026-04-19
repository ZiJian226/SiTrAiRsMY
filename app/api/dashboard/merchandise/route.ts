import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/apiAuth'
import { logUserAuditEvent } from '@/lib/auditLog'
import { dbQuery } from '@/lib/database'
import {
  getUserMerchandise,
  createUserMerchandise,
  updateUserMerchandise,
  deleteUserMerchandise,
  getUserMerchandiseById
} from '@/lib/user/repository'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await getUserMerchandise(user.id)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching merchandise:', error)
    return NextResponse.json({ error: 'Failed to fetch merchandise' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const profileResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id])
    const actorRole = profileResult.rows[0]?.role as 'talent' | 'artist' | 'admin' | undefined

    if (!body.name || !body.category || body.price === undefined) {
      return NextResponse.json(
        { error: 'name, category, and price are required' },
        { status: 400 }
      )
    }

    const item = await createUserMerchandise(user.id, {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      image_url: body.image_url,
      image_object_key: body.image_object_key,
      category: body.category,
      stock: parseInt(body.stock) || 0,
      is_published: body.is_published ?? false
    })

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole,
      action: 'merchandise.create',
      resourceType: 'merchandise',
      resourceId: item.id,
      targetUserId: user.id,
      metadata: {
        name: item.name,
        category: item.category,
        price: item.price,
        stock: item.stock,
        is_published: item.is_published,
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating merchandise:', error)
    return NextResponse.json({ error: 'Failed to create merchandise' }, { status: 500 })
  }
}
