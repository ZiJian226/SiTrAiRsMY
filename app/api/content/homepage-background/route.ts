import { getHomepageHeroConfig } from '@/lib/admin/homepageBackgroundRepository';

export async function GET() {
  try {
    const config = await getHomepageHeroConfig();

    return Response.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching homepage hero config:', error);
    return Response.json(
      { error: 'Failed to fetch homepage background' },
      { status: 500 }
    );
  }
}
