import { NextRequest } from 'next/server';
import { getAgencyRequirements } from '@/lib/admin/agencyRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const requirements = await getAgencyRequirements(role || undefined);

    return Response.json({
      success: true,
      data: requirements,
    });
  } catch (error) {
    console.error('Error fetching agency requirements:', error);
    return Response.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
}
