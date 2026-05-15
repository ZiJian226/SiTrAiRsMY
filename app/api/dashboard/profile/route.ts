import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/apiAuth'
import { dbQuery } from '@/lib/database'
import { logUserAuditEvent } from '@/lib/auditLog'
import { getAuditRequestContext } from '@/lib/auditLog'
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
    const role = profileResult.rows[0]?.role as 'talent' | 'staff' | 'artist' | 'admin' | undefined

    console.log('GET /api/dashboard/profile:', { userId: user.id, role })

    if (role === 'artist') {
      let artistProfile = await getArtistProfileByUserId(user.id)
      if (!artistProfile) {
        artistProfile = await createArtistProfile(user.id)
      }

      const baseProfileResult = await dbQuery(
        `SELECT email, full_name, bio, avatar_url FROM profiles WHERE user_id = $1 LIMIT 1`,
        [user.id],
      )

      const baseProfile = baseProfileResult.rows[0] as
        | { email: string; full_name: string | null; bio: string | null; avatar_url: string | null }
        | undefined

      return NextResponse.json({
        ...artistProfile,
        email: baseProfile?.email ?? null,
        full_name: baseProfile?.full_name ?? null,
        bio: baseProfile?.bio ?? null,
        avatar_url: baseProfile?.avatar_url ?? null,
      })
    }

    if (role === 'talent' || role === 'staff') {
      // Ensure talent profile exists (insert if not exists) with default stage_name
      const baseProfileResult = await dbQuery(
        `SELECT email, full_name, bio, avatar_url FROM profiles WHERE user_id = $1 LIMIT 1`,
        [user.id],
      )
      const baseProfile = baseProfileResult.rows[0] as
        | { email: string; full_name: string | null; bio: string | null; avatar_url: string | null }
        | undefined

      await dbQuery(
        `INSERT INTO talent_profiles (user_id, stage_name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, baseProfile?.full_name || user.email],
      )

      let talentProfile = await getTalentProfileByUserId(user.id)
      if (!talentProfile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      // Get base profile data for email and fallback values
      const baseProfileResultReturn = await dbQuery(
        `SELECT email, full_name, bio, avatar_url FROM profiles WHERE user_id = $1 LIMIT 1`,
        [user.id],
      )
      const baseProfileReturn = baseProfileResultReturn.rows[0] as
        | { email: string; full_name: string | null; bio: string | null; avatar_url: string | null }
        | undefined

      // Merge talent profile with base profile data
      // Talent profile data takes precedence, but we use base profile for email and as fallback for certain fields
      return NextResponse.json({
        ...talentProfile,
        email: baseProfileReturn?.email ?? null,
        // Use talent profile's bio/avatar_url if available, otherwise fall back to base profile
        bio: talentProfile.bio ?? baseProfileReturn?.bio ?? null,
        avatar_url: talentProfile.avatar_url ?? baseProfileReturn?.avatar_url ?? null,
        // For fields that exist in both tables but serve different purposes, keep talent profile values
        // profile_picture_url and portrait_picture_url are talent-specific, so we keep them as-is
      })
    }

    // For admin roles, return base profile data
    const baseProfileResult = await dbQuery(
      `SELECT id, user_id, email, full_name, bio, avatar_url, role FROM profiles WHERE user_id = $1 LIMIT 1`,
      [user.id],
    )

    const baseProfile = baseProfileResult.rows[0] as
      | {
          id: string
          user_id: string
          email: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          role: 'talent' | 'staff' | 'artist' | 'admin'
        }
      | undefined

    if (!baseProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(baseProfile)
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
    const auditContext = getAuditRequestContext(request.headers)

    const profileResult = await dbQuery('SELECT role FROM profiles WHERE user_id = $1 LIMIT 1', [user.id])
    const role = profileResult.rows[0]?.role as 'talent' | 'staff' | 'artist' | 'admin' | undefined

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
        portfolio_art: Array.isArray(body.portfolio_art) ? body.portfolio_art : undefined,
        portfolio_art_images: Array.isArray(body.portfolio_art_images) ? body.portfolio_art_images : undefined,
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
        category: 'profile',
        eventType: 'update',
        resourceType: 'artist_profile',
        resourceId: artistProfile.id,
        targetUserId: user.id,
        metadata: {
          updatedFields: Object.keys(body || {}),
        },
        ...auditContext,
      })

      return NextResponse.json(artistProfile)
    }

    if (role === 'talent' || role === 'staff') {
      // Get base profile for default values
      const baseProfileForInsert = await dbQuery(
        `SELECT email, full_name, bio, avatar_url FROM profiles WHERE user_id = $1 LIMIT 1`,
        [user.id],
      )
      const baseProfileData = baseProfileForInsert.rows[0] as
        | { email: string; full_name: string | null; bio: string | null; avatar_url: string | null }
        | undefined

      // Ensure talent profile exists (insert if not exists) with default stage_name
      await dbQuery(
        `INSERT INTO talent_profiles (user_id, stage_name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING`,
        [user.id, baseProfileData?.full_name || body.full_name || user.email],
      )

      const talentProfile = await updateTalentProfile(user.id, body)

      await logUserAuditEvent({
        actorUserId: user.id,
        actorRole: role,
        action: 'profile.update',
        category: 'profile',
        eventType: 'update',
        resourceType: 'talent_profile',
        resourceId: talentProfile.id,
        targetUserId: user.id,
        metadata: {
          updatedFields: Object.keys(body || {}),
        },
        ...auditContext,
      })

      // Get base profile data to return with updated talent profile
      const baseProfileResult = await dbQuery(
        `SELECT email, full_name, bio, avatar_url FROM profiles WHERE user_id = $1 LIMIT 1`,
        [user.id],
      )
      const baseProfile = baseProfileResult.rows[0] as
        | { email: string; full_name: string | null; bio: string | null; avatar_url: string | null }
        | undefined

      // Merge talent profile with base profile data for consistent response
      // Talent profile data takes precedence, but we use base profile for email and as fallback for certain fields
      return NextResponse.json({
        ...talentProfile,
        email: baseProfile?.email ?? null,
        // Use talent profile's bio/avatar_url if available, otherwise fall back to base profile
        bio: talentProfile.bio ?? baseProfile?.bio ?? null,
        avatar_url: talentProfile.avatar_url ?? baseProfile?.avatar_url ?? null,
      })
    }

    // For admin roles, update only base profile fields
    const baseProfileUpdateResult = await dbQuery(
      `
      UPDATE profiles
      SET full_name = COALESCE($2, full_name),
          bio = COALESCE($3, bio),
          avatar_url = COALESCE($4, avatar_url),
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING id, user_id, email, full_name, bio, avatar_url, role
      `,
      [
        user.id,
        typeof body.full_name === 'string' ? body.full_name : null,
        typeof body.bio === 'string' ? body.bio : null,
        typeof body.avatar_url === 'string' ? body.avatar_url : null,
      ],
    )

    const updatedProfile = baseProfileUpdateResult.rows[0] as
      | {
          id: string
          user_id: string
          email: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          role: 'talent' | 'staff' | 'artist' | 'admin'
        }
      | undefined

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    await logUserAuditEvent({
      actorUserId: user.id,
      actorRole: role,
      action: 'profile.update',
      category: 'profile',
      eventType: 'update',
      resourceType: 'profile',
      resourceId: updatedProfile.id,
      targetUserId: user.id,
      metadata: {
        updatedFields: Object.keys(body || {}),
      },
      ...auditContext,
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
