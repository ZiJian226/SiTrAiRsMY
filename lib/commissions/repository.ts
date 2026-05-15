import 'server-only';

import { dbQuery } from '@/lib/database';

export type CommissionStatus = 'pending' | 'accepted' | 'rejected';

export interface CommissionRequestRecord {
  id: string;
  artist_profile_id: string;
  client_name: string;
  client_email: string;
  description: string;
  budget: string;
  deadline: string | null;
  status: CommissionStatus;
  accepted_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
}

async function getArtistProfileById(artistProfileId: string) {
  const result = await dbQuery(
    `
    SELECT
      p.id AS profile_id,
      p.user_id,
      p.full_name,
      p.role,
      ap.id AS artist_profile_id,
      COALESCE(ap.commissions_open, false) AS commissions_open
    FROM profiles p
    LEFT JOIN artist_profiles ap ON ap.user_id = p.user_id
    WHERE (p.id = $1 OR ap.id = $1)
      AND p.role = 'artist'
    LIMIT 1
    `,
    [artistProfileId],
  );

  return result.rows[0] as
    | {
        profile_id: string;
        user_id: string;
        full_name: string | null;
        role: 'artist';
        artist_profile_id: string | null;
        commissions_open: boolean;
      }
    | undefined;
}

async function getArtistProfileForUser(userId: string) {
  const result = await dbQuery(
    `
    SELECT ap.id, ap.user_id, p.full_name
    FROM artist_profiles ap
    JOIN profiles p ON ap.user_id = p.user_id
    WHERE ap.user_id = $1
    LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] as { id: string; user_id: string; full_name: string | null } | undefined;
}

export async function createCommissionRequest(input: {
  artistProfileId: string;
  clientName: string;
  clientEmail: string;
  description: string;
  budget: string;
  deadline?: string | null;
}): Promise<CommissionRequestRecord> {
  const artist = await getArtistProfileById(input.artistProfileId);

  if (!artist) {
    throw new Error('Artist not found');
  }

  // If no artist_profile exists, create one automatically
  let resolvedArtistProfileId = artist.artist_profile_id;
  if (!resolvedArtistProfileId) {
    try {
      const createResult = await dbQuery(
        `
        INSERT INTO artist_profiles (user_id, commissions_open)
        VALUES ($1, true)
        ON CONFLICT (user_id) DO UPDATE SET commissions_open = true
        RETURNING id
        `,
        [artist.user_id],
      );
      resolvedArtistProfileId = createResult.rows[0]?.id;
    } catch (err) {
      throw new Error('Failed to create artist profile for commissions');
    }
  }

  if (!resolvedArtistProfileId) {
    throw new Error('This artist does not have a valid profile for commissions');
  }

  if (!artist.commissions_open) {
    throw new Error('This artist is currently not accepting commissions');
  }

  const result = await dbQuery(
    `
    INSERT INTO commission_requests (
      artist_profile_id,
      client_name,
      client_email,
      description,
      budget,
      deadline,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING *
    `,
    [
      resolvedArtistProfileId,
      input.clientName,
      input.clientEmail,
      input.description,
      input.budget,
      input.deadline || null,
    ],
  );

  return result.rows[0] as CommissionRequestRecord;
}

export async function getArtistCommissionDashboard(userId: string): Promise<{
  artistProfileId: string | null;
  artistName: string | null;
  pending: CommissionRequestRecord[];
  ongoing: CommissionRequestRecord[];
}> {
  const artistProfile = await getArtistProfileForUser(userId);

  if (!artistProfile) {
    return {
      artistProfileId: null,
      artistName: null,
      pending: [],
      ongoing: [],
    };
  }

  const requestsResult = await dbQuery(
    `
    SELECT
      cr.id,
      cr.artist_profile_id,
      cr.client_name,
      cr.client_email,
      cr.description,
      cr.budget,
      cr.deadline,
      cr.status,
      cr.accepted_at,
      cr.rejected_at,
      cr.created_at,
      cr.updated_at
    FROM commission_requests cr
    WHERE cr.artist_profile_id = $1
      AND cr.status IN ('pending', 'accepted')
    ORDER BY CASE cr.status WHEN 'pending' THEN 0 ELSE 1 END, cr.created_at DESC
    `,
    [artistProfile.id],
  );

  const requests = (requestsResult.rows || []) as CommissionRequestRecord[];

  return {
    artistProfileId: artistProfile.id,
    artistName: artistProfile.full_name,
    pending: requests.filter((request) => request.status === 'pending'),
    ongoing: requests.filter((request) => request.status === 'accepted'),
  };
}

export async function getCommissionRequestByIdForArtist(userId: string, requestId: string): Promise<CommissionRequestRecord | null> {
  const result = await dbQuery(
    `
    SELECT
      cr.id,
      cr.artist_profile_id,
      cr.client_name,
      cr.client_email,
      cr.description,
      cr.budget,
      cr.deadline,
      cr.status,
      cr.accepted_at,
      cr.rejected_at,
      cr.created_at,
      cr.updated_at
    FROM commission_requests cr
    INNER JOIN artist_profiles ap ON ap.id = cr.artist_profile_id
    WHERE cr.id = $1
      AND ap.user_id = $2
    LIMIT 1
    `,
    [requestId, userId],
  );

  return (result.rows[0] || null) as CommissionRequestRecord | null;
}

export async function updateCommissionRequestStatusForArtist(
  userId: string,
  requestId: string,
  nextStatus: 'accepted' | 'rejected',
): Promise<CommissionRequestRecord | null> {
  const result = await dbQuery(
    `
    UPDATE commission_requests cr
    SET status = $3,
        accepted_at = CASE WHEN $3 = 'accepted' THEN NOW() ELSE accepted_at END,
        rejected_at = CASE WHEN $3 = 'rejected' THEN NOW() ELSE rejected_at END,
        updated_at = NOW()
    FROM artist_profiles ap
    WHERE cr.id = $1
      AND cr.artist_profile_id = ap.id
      AND ap.user_id = $2
      AND cr.status = 'pending'
    RETURNING cr.id, cr.artist_profile_id, cr.client_name, cr.client_email, cr.description, cr.budget, cr.deadline, cr.status, cr.accepted_at, cr.rejected_at, cr.created_at, cr.updated_at
    `,
    [requestId, userId, nextStatus],
  );

  return (result.rows[0] || null) as CommissionRequestRecord | null;
}
