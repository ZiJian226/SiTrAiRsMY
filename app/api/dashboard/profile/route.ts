import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/apiAuth'
import { dbQuery } from '@/lib/database'
import { logUserAuditEvent } from '@/lib/auditLog'
import {
  createArtistProfile,
  getArtistProfileByUserId,
  getTalentProfileByUserId,
  updateArtistProfile,
  updateTalentProfile,
} from '@/lib/user/repository'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profileResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id])
    const role = profileResult.rows[0]?.role as 'talent' | 'artist' | 'admin' | undefined

    if (role === 'artist') {
      let artistProfile = await getArtistProfileByUserId(user.id)
      if (!artistProfile) {
        artistProfile = await createArtistProfile(user.id)
      }

      const baseProfileResult = await dbQuery(
        `SELECT full_name, bio, avatar_url FROM profiles WHERE user_id = $1 LIMIT 1`,
        [user.id],
      )

      const baseProfile = baseProfileResult.rows[0] as
        | { full_name: string | null; bio: string | null; avatar_url: string | null }
        | undefined

      return NextResponse.json({
        ...artistProfile,
        full_name: baseProfile?.full_name ?? null,
        bio: baseProfile?.bio ?? null,
        avatar_url: baseProfile?.avatar_url ?? null,
      })
    }

    const talentProfile = await getTalentProfileByUserId(user.id)
    if (!talentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(talentProfile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const profileResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id])
    const role = profileResult.rows[0]?.role as 'talent' | 'artist' | 'admin' | undefined

    if (role === 'artist') {
      await dbQuery(
        `
        UPDATE profiles
        SET full_name = COALESCE($2, full_name),
            bio = COALESCE($3, bio),
            avatar_url = COALESCE($4, avatar_url),
            updated_at = NOW()
        WHERE user_id = $1
        `,
        [
          user.id,
          typeof body.full_name === 'string' ? body.full_name : null,
          typeof body.bio === 'string' ? body.bio : null,
          typeof body.avatar_url === 'string' ? body.avatar_url : null,
        ],
      )

      const artistPayload = {
        specialty: Array.isArray(body.specialty) ? body.specialty : undefined,
        portfolio_links: Array.isArray(body.portfolio_links) ? body.portfolio_links : undefined,
        commissions_open: typeof body.commissions_open === 'boolean' ? body.commissions_open : undefined,
        price_range: typeof body.price_range === 'string' || body.price_range === null ? body.price_range : undefined,
        contact_email: typeof body.contact_email === 'string' || body.contact_email === null ? body.contact_email : undefined,
        social_media_links:
          typeof body.social_media_links === 'object' && body.social_media_links !== null
            ? body.social_media_links
            : undefined,
      }

      const artistProfile = await updateArtistProfile(user.id, artistPayload)

      await logUserAuditEvent({
        actorUserId: user.id,
        actorRole: role,
        action: 'profile.update',
        resourceType: 'artist_profile',
        resourceId: artistProfile.id,
        targetUserId: user.id,
        metadata: {
          updatedFields: Object.keys(body || {}),
        },
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
      })

      return NextResponse.json(artistProfile)
    }

    const talentProfile = await updateTalentProfile(user.id, body)

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole: role,
      action: 'profile.update',
      resourceType: 'talent_profile',
      resourceId: talentProfile.id,
      targetUserId: user.id,
      metadata: {
        updatedFields: Object.keys(body || {}),
      },
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    })

    return NextResponse.json(talentProfile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
