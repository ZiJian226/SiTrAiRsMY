import { NextRequest } from 'next/server';
import { getAgencyBenefits } from '@/lib/admin/agencyRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const benefits = await getAgencyBenefits(category || undefined);

    return Response.json({
      success: true,
      data: benefits,
    });
  } catch (error) {
    console.error('Error fetching agency benefits:', error);
    return Response.json(
      { error: 'Failed to fetch benefits' },
      { status: 500 }
    );
  }
}
