import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { getObjectStorageBucket, getObjectStorageClient } from '@/lib/objectStorage';

export const runtime = 'nodejs';

function getContentType(key: string): string {
  const lower = key.toLowerCase();

  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';

  return 'application/octet-stream';
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  const objectKey = params.path.map(segment => decodeURIComponent(segment)).join('/').trim();

  if (!objectKey) {
    return NextResponse.json({ error: 'Image path is required.' }, { status: 400 });
  }

  const client = getObjectStorageClient();
  const bucket = getObjectStorageBucket();

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: objectKey,
      }),
    );

    if (!response.Body) {
      return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
    }

    const body = response.Body as { transformToByteArray: () => Promise<Uint8Array> };
    const bytes = await body.transformToByteArray();
    const contentType = response.ContentType || getContentType(objectKey);

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}