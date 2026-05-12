import 'server-only';

import { dbQuery } from '@/lib/database';

export interface CareerApplication {
  id: string;
  name: string;
  email: string;
  position: string;
  portfolio_url: string | null;
  motivation: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityApplication {
  id: string;
  name: string;
  email: string;
  country: string;
  discord_name?: string | null;
  is_malaysian: boolean;
  supporting_info: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Submit a career application
 */
export async function createCareerApplication(
  name: string,
  email: string,
  position: string,
  motivation: string,
  portfolioUrl?: string | null
): Promise<CareerApplication> {
  try {
    const result = await dbQuery(
      `INSERT INTO career_applications (name, email, position, portfolio_url, motivation, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, position, portfolioUrl || null, motivation, 'pending']
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to create career application');
    }

    return result.rows[0] as CareerApplication;
  } catch (error) {

    throw error;
  }
}

/**
 * Submit a community application
 */
export async function createCommunityApplication(
  name: string,
  discordName: string,
  supportingInfo: string,
  isMalaysian: boolean = true,
  email?: string | null,
  country: string = 'Malaysia'
): Promise<CommunityApplication> {
  try {
    if (!isMalaysian) {
      throw new Error('Community applications are restricted to Malaysian applicants');
    }

    if (!discordName) {
      throw new Error('Discord name is required');
    }
    const result = await dbQuery(
      `INSERT INTO community_applications (name, email, discord_name, is_malaysian, country, supporting_info, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email || null, discordName, isMalaysian, country, supportingInfo, 'pending']
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to create community application');
    }

    return result.rows[0] as CommunityApplication;
  } catch (error) {

    throw error;
  }
}

/**
 * Get all career applications with optional filtering
 */
export async function getCareerApplications(
  status?: string
): Promise<CareerApplication[]> {
  try {
    let query = 'SELECT * FROM career_applications';
    const params: unknown[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await dbQuery(query, params);
    return (result.rows || []) as CareerApplication[];
  } catch (error) {

    throw error;
  }
}

/**
 * Get all community applications with optional filtering
 */
export async function getCommunityApplications(
  status?: string
): Promise<CommunityApplication[]> {
  try {
    let query = 'SELECT * FROM community_applications';
    const params: unknown[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await dbQuery(query, params);
    return (result.rows || []) as CommunityApplication[];
  } catch (error) {

    throw error;
  }
}

/**
 * Get a single career application by ID
 */
export async function getCareerApplicationById(
  id: string
): Promise<CareerApplication | null> {
  try {
    const result = await dbQuery(
      'SELECT * FROM career_applications WHERE id = $1',
      [id]
    );

    return (result.rows?.[0] || null) as CareerApplication | null;
  } catch (error) {

    throw error;
  }
}

/**
 * Get a single community application by ID
 */
export async function getCommunityApplicationById(
  id: string
): Promise<CommunityApplication | null> {
  try {
    const result = await dbQuery(
      'SELECT * FROM community_applications WHERE id = $1',
      [id]
    );

    return (result.rows?.[0] || null) as CommunityApplication | null;
  } catch (error) {

    throw error;
  }
}

/**
 * Update career application status and admin notes
 */
export async function updateCareerApplication(
  id: string,
  status: string,
  adminNotes?: string | null
): Promise<CareerApplication | null> {
  try {
    const result = await dbQuery(
      `UPDATE career_applications 
       SET status = $1, admin_notes = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, adminNotes || null, id]
    );

    return (result.rows?.[0] || null) as CareerApplication | null;
  } catch (error) {

    throw error;
  }
}

/**
 * Update community application status and admin notes
 */
export async function updateCommunityApplication(
  id: string,
  status: string,
  adminNotes?: string | null
): Promise<CommunityApplication | null> {
  try {
    const result = await dbQuery(
      `UPDATE community_applications 
       SET status = $1, admin_notes = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, adminNotes || null, id]
    );

    return (result.rows?.[0] || null) as CommunityApplication | null;
  } catch (error) {

    throw error;
  }
}

/**
 * Get application statistics
 */
export async function getApplicationStats(): Promise<{
  careerTotal: number;
  careerPending: number;
  communityTotal: number;
  communityPending: number;
}> {
  try {
    const careerResult = await dbQuery(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::INT as pending
       FROM career_applications`
    );

    const communityResult = await dbQuery(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::INT as pending
       FROM community_applications`
    );

    return {
      careerTotal: careerResult.rows?.[0]?.total || 0,
      careerPending: careerResult.rows?.[0]?.pending || 0,
      communityTotal: communityResult.rows?.[0]?.total || 0,
      communityPending: communityResult.rows?.[0]?.pending || 0,
    };
  } catch (error) {

    throw error;
  }
}
