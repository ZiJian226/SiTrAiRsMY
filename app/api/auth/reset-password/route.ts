import { NextRequest, NextResponse } from 'next/server'
import { verifyPasswordResetToken, usePasswordResetToken, resetUserPassword } from '@/lib/auth/passwordReset'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      token?: string
      password?: string
    }

    if (!body.token || !body.password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (body.password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Verify token is valid
    const userId = await verifyPasswordResetToken(body.token)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Mark token as used
    const tokenUsed = await usePasswordResetToken(body.token)
    if (!tokenUsed) {
      return NextResponse.json({ error: 'Failed to process reset' }, { status: 500 })
    }

    // Reset password
    const updated = await resetUserPassword(userId, body.password)
    if (!updated) {
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Password reset confirmation error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
