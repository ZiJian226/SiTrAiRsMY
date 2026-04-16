import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/apiAuth'
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

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating merchandise:', error)
    return NextResponse.json({ error: 'Failed to create merchandise' }, { status: 500 })
  }
}
