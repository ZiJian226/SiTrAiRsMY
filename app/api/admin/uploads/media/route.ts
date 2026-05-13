import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import {
  buildObjectStorageObjectKey,
  buildObjectStorageMediaUrl,
  getObjectStorageBucket,
  getObjectStorageClient,
} from '@/lib/objectStorage';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 250 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
]);

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') || 'gallery').trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Media file is required.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File exceeds 250MB limit.' }, { status: 400 });
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+|\/+$/g, '') || 'gallery';
    const safeName = sanitizeFileName(file.name || 'media');
    const objectKey = buildObjectStorageObjectKey(
      safeFolder,
      `${Date.now()}-${crypto.randomUUID()}-${safeName}`,
    );

    const fileBytes = Buffer.from(await file.arrayBuffer());
    const objectStorageClient = getObjectStorageClient();
    const objectStorageBucket = getObjectStorageBucket();

    await objectStorageClient.send(
      new PutObjectCommand({
        Bucket: objectStorageBucket,
        Key: objectKey,
        Body: fileBytes,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return NextResponse.json({
      key: objectKey,
      url: buildObjectStorageMediaUrl(objectKey),
      contentType: file.type,
      size: file.size,
      mediaType: file.type.startsWith('video/') ? 'video' : 'photo',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload media';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
