import 'server-only';

import { dbQuery } from '@/lib/database';
import type { AgencyRequirement, AgencyBenefit } from '@/lib/types';

/**
 * Get all agency requirements with optional filtering
 */
export async function getAgencyRequirements(role?: string): Promise<AgencyRequirement[]> {
  try {
    let query = 'SELECT * FROM agency_requirements WHERE is_active = true';
    const params: unknown[] = [];

    if (role) {
      query += ` AND (role = 'general' OR role = $${params.length + 1})`;
      params.push(role);
    }

    query += ' ORDER BY role ASC, "order" ASC';

    const result = await dbQuery(query, params);
    return (result.rows || []) as AgencyRequirement[];
  } catch (error) {
    console.error('Error fetching agency requirements:', error);
    throw error;
  }
}

/**
 * Get all agency benefits with optional filtering
 */
export async function getAgencyBenefits(category?: string): Promise<AgencyBenefit[]> {
  try {
    let query = 'SELECT * FROM agency_benefits WHERE is_active = true';
    const params: unknown[] = [];

    if (category) {
      query += ` AND category = $1`;
      params.push(category);
    }

    query += ' ORDER BY category ASC, "order" ASC';

    const result = await dbQuery(query, params);
    return (result.rows || []) as AgencyBenefit[];
  } catch (error) {
    console.error('Error fetching agency benefits:', error);
    throw error;
  }
}

/**
 * Create a new agency requirement
 */
export async function createAgencyRequirement(
  role: string,
  title: string,
  description: string,
  emoji?: string,
  order: number = 0
): Promise<AgencyRequirement> {
  try {
    const result = await dbQuery(
      `INSERT INTO agency_requirements (role, title, description, emoji, "order", is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [role, title, description, emoji || null, order]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to create agency requirement');
    }

    return result.rows[0] as AgencyRequirement;
  } catch (error) {
    console.error('Error creating agency requirement:', error);
    throw error;
  }
}

/**
 * Create a new agency benefit
 */
export async function createAgencyBenefit(
  category: string,
  title: string,
  description: string,
  emoji?: string,
  order: number = 0
): Promise<AgencyBenefit> {
  try {
    const result = await dbQuery(
      `INSERT INTO agency_benefits (category, title, description, emoji, "order", is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [category, title, description, emoji || null, order]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to create agency benefit');
    }

    return result.rows[0] as AgencyBenefit;
  } catch (error) {
    console.error('Error creating agency benefit:', error);
    throw error;
  }
}

/**
 * Update an agency requirement
 */
export async function updateAgencyRequirement(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    emoji: string | null;
    order: number;
    is_active: boolean;
  }>
): Promise<AgencyRequirement | null> {
  try {
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClauses.push(`${key === 'order' ? '"order"' : key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (setClauses.length === 0) {
      return null;
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE agency_requirements 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await dbQuery(query, params);
    return (result.rows?.[0] || null) as AgencyRequirement | null;
  } catch (error) {
    console.error('Error updating agency requirement:', error);
    throw error;
  }
}

/**
 * Update an agency benefit
 */
export async function updateAgencyBenefit(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    emoji: string | null;
    order: number;
    is_active: boolean;
  }>
): Promise<AgencyBenefit | null> {
  try {
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setClauses.push(`${key === 'order' ? '"order"' : key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    if (setClauses.length === 0) {
      return null;
    }

    setClauses.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE agency_benefits 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await dbQuery(query, params);
    return (result.rows?.[0] || null) as AgencyBenefit | null;
  } catch (error) {
    console.error('Error updating agency benefit:', error);
    throw error;
  }
}

/**
 * Delete an agency requirement
 */
export async function deleteAgencyRequirement(id: string): Promise<boolean> {
  try {
    const result = await dbQuery(
      'DELETE FROM agency_requirements WHERE id = $1',
      [id]
    );

    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Error deleting agency requirement:', error);
    throw error;
  }
}

/**
 * Delete an agency benefit
 */
export async function deleteAgencyBenefit(id: string): Promise<boolean> {
  try {
    const result = await dbQuery(
      'DELETE FROM agency_benefits WHERE id = $1',
      [id]
    );

    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Error deleting agency benefit:', error);
    throw error;
  }
}

/**
 * Reorder agency requirements (bulk update order)
 */
export async function reorderAgencyRequirements(
  items: Array<{ id: string; order: number }>
): Promise<AgencyRequirement[]> {
  try {
    const updates = await Promise.all(
      items.map((item) =>
        dbQuery(
          'UPDATE agency_requirements SET "order" = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [item.order, item.id]
        )
      )
    );

    return updates.flatMap((result) => (result.rows || []) as AgencyRequirement[]);
  } catch (error) {
    console.error('Error reordering agency requirements:', error);
    throw error;
  }
}

/**
 * Reorder agency benefits (bulk update order)
 */
export async function reorderAgencyBenefits(
  items: Array<{ id: string; order: number }>
): Promise<AgencyBenefit[]> {
  try {
    const updates = await Promise.all(
      items.map((item) =>
        dbQuery(
          'UPDATE agency_benefits SET "order" = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [item.order, item.id]
        )
      )
    );

    return updates.flatMap((result) => (result.rows || []) as AgencyBenefit[]);
  } catch (error) {
    console.error('Error reordering agency benefits:', error);
    throw error;
  }
}
