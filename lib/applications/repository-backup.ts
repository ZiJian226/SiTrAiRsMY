// import 'server-only';

// import { dbQuery } from '@/lib/database';

// export interface CareerApplication {
//   id: string;
//   name: string;
//   email: string;
//   position: string;
//   portfolio_url: string | null;
//   tiktok_username: string | null;
//   motivation: string;
//   status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
//   admin_notes: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface AgencyApplication {
//   id: string;
//   name: string;
//   email: string;
//   country: string;
//   discord_name?: string | null;
//   is_malaysian: boolean;
//   supporting_info: string;
//   status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
//   admin_notes: string | null;
//   created_at: string;
//   updated_at: string;
// }

// // Legacy type alias for backward compatibility
// /**
//  * Submit a career application
//  */
// export async function createCareerApplication(
//   name: string,
//   email: string,
//   position: string,
//   motivation: string,
//   portfolioUrl?: string | null,
//   tiktokUsername?: string | null
// ): Promise<CareerApplication> {
//   try {
//     const result = await dbQuery(
//       `INSERT INTO career_applications (name, email, position, portfolio_url, tiktok_username, motivation, status)
//        VALUES ($1, $2, $3, $4, $5, $6, $7)
//        RETURNING *`,
//       [name, email, position, portfolioUrl || null, tiktokUsername || null, motivation, 'pending']
//     );

//     if (!result.rows || result.rows.length === 0) {
//       throw new Error('Failed to create career application');
//     }

//     return result.rows[0] as CareerApplication;
//   } catch (error) {

//     throw error;
//   }
// }

// /**
//  * Submit a community application
//  */
// export async function createAgencyApplication(
//   name: string,
//   email: string,
//   discordName: string,
//   supportingInfo: string,
//   isMalaysian: boolean = true,
//   country: string = 'Malaysia'
// ): Promise<AgencyApplication> {
//   try {
//     if (!isMalaysian) {
//       throw new Error('Agency applications are restricted to Malaysian applicants');
//     }

//     if (!discordName) {
//       throw new Error('Discord name is required');
//     }
//     const result = await dbQuery(
//       `INSERT INTO agency_applications (name, email, discord_name, is_malaysian, country, supporting_info, status)
//        VALUES ($1, $2, $3, $4, $5, $6, $7)
//        RETURNING *`,
//       [name, email, discordName, isMalaysian, country, supportingInfo, 'pending']
//     );

//     if (!result.rows || result.rows.length === 0) {
//       throw new Error('Failed to create agency application');
//     }

//     return result.rows[0] as AgencyApplication;
// // Legacy function alias for backward compatibility
// export const createCommunityApplication = createAgencyApplication;


//   } catch (error) {

//     throw error;
//   }
// }

// /**
//  * Get all career applications with optional filtering
//  */
// export async function getCareerApplications(
//   status?: string
// ): Promise<CareerApplication[]> {
//   try {
//     let query = 'SELECT * FROM career_applications';
//     const params: unknown[] = [];

//     if (status) {
//       query += ' WHERE status = $1';
//       params.push(status);
//     }

//     query += ' ORDER BY created_at DESC';

//     const result = await dbQuery(query, params);
//     return (result.rows || []) as CareerApplication[];
//   } catch (error) {

//     throw error;
//   }
// }

// /**
//  * Get all community applications with optional filtering
//  */
// export async function getAgencyApplications(
//   status?: string
// ): Promise<AgencyApplication[]> {
//   try {
//     let query = 'SELECT * FROM agency_applications';
//     const params: unknown[] = [];

//     if (status) {
//       query += ' WHERE status = $1';
//       params.push(status);
//     }

//     query += ' ORDER BY created_at DESC';

//     const result = await dbQuery(query, params);
//     return (result.rows || []) as AgencyApplication[];
//   // Legacy function alias for backward compatibility
//   export const getCommunityApplications = getAgencyApplications;

//   } catch (error) {

//     throw error;
//   }
// }

// /**
//  * Get a single career application by ID
//  */
// export async function getCareerApplicationById(
//   id: string
// ): Promise<CareerApplication | null> {
//   try {
//     const result = await dbQuery(
//       'SELECT * FROM career_applications WHERE id = $1',
//       [id]
//     );

//     return (result.rows?.[0] || null) as CareerApplication | null;
//   } catch (error) {

//     throw error;
//   }
// }

// /**
//  * Get a single community application by ID
//  */
// export async function getAgencyApplicationById(
//   id: string
// ): Promise<AgencyApplication | null> {
//   try {
//     const result = await dbQuery(
//       'SELECT * FROM agency_applications WHERE id = $1',
//       [id]
//     );

//     return (result.rows?.[0] || null) as AgencyApplication | null;
//   // Legacy function alias for backward compatibility
//   export const getCommunityApplicationById = getAgencyApplicationById;

//   } catch (error) {

//     throw error;
//   }
// }

// /**
//  * Update career application status and admin notes
//  */
// export async function updateCareerApplication(
//   id: string,
//   status: string,
//   adminNotes?: string | null
// ): Promise<CareerApplication | null> {
//   try {
//     const result = await dbQuery(
//       `UPDATE career_applications 
//        SET status = $1, admin_notes = $2, updated_at = NOW()
//        WHERE id = $3
//        RETURNING *`,
//       [status, adminNotes || null, id]
//     );

//     return (result.rows?.[0] || null) as CareerApplication | null;
//   } catch (error) {

//     throw error;
//   }
// }

// /**
//  * Update community application status and admin notes
//  */
// export async function updateAgencyApplication(
//   id: string,
//   status: string,
//   adminNotes?: string | null
// ): Promise<AgencyApplication | null> {
//   try {
//     const result = await dbQuery(
//       `UPDATE agency_applications 
//        SET status = $1, admin_notes = $2, updated_at = NOW()
//        WHERE id = $3
//        RETURNING *`,
//       [status, adminNotes || null, id]
//     );

//     return (result.rows?.[0] || null) as AgencyApplication | null;
//   // Legacy function alias for backward compatibility
//   export const updateCommunityApplication = updateAgencyApplication;

//   } catch (error) {

//     throw error;
//   }
// }

// /**
//  * Get application statistics
//  */
// export async function getApplicationStats(): Promise<{
//   careerTotal: number;
//   careerPending: number;
//   agencyTotal: number;
//   agencyPending: number;
// }> {
//   try {
//     const careerResult = await dbQuery(
//       `SELECT 
//         COUNT(*) as total,
//         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::INT as pending
//        FROM career_applications`
//     );

//     const agencyResult = await dbQuery(
//       `SELECT 
//         COUNT(*) as total,
//         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::INT as pending
//       FROM agency_applications`
//     );

//     return {
//       careerTotal: careerResult.rows?.[0]?.total || 0,
//       careerPending: careerResult.rows?.[0]?.pending || 0,
//       agencyTotal: agencyResult.rows?.[0]?.total || 0,
//       agencyPending: agencyResult.rows?.[0]?.pending || 0,
//     };
//   } catch (error) {

//     throw error;
//   }
// }

// // Legacy type alias for backward compatibility
// export type CommunityApplication = AgencyApplication;
