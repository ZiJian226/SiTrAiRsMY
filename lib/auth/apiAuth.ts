import { NextRequest } from 'next/server'
import { dbQuery } from '@/lib/database'

/**
 * Extract user ID from request headers
 * Client should pass the user ID in X-User-ID header
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{ id: string; email: string } | null> {
  const userId = request.headers.get('x-user-id')
  
  if (!userId) {
    return null
  }

  try {
    // Verify the user exists and is active
    const result = await dbQuery(
      `SELECT id, email FROM users WHERE id = $1 AND is_active = true LIMIT 1`,
      [userId]
    )

    if (result.rows.length === 0) {
      return null
    }

    return {
      id: result.rows[0].id,
      email: result.rows[0].email
    }
  } catch {
    return null
  }
}
