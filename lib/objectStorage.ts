import { S3Client } from '@aws-sdk/client-s3';

type ObjectStorageConfig = {
  region: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl?: string;
};

function getObjectStorageConfig(): ObjectStorageConfig {
  const region = process.env.OBJECT_STORAGE_REGION;
  const endpoint = process.env.OBJECT_STORAGE_ENDPOINT;
  const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
  const bucket = process.env.OBJECT_STORAGE_BUCKET;
  const publicBaseUrl = process.env.OBJECT_STORAGE_PUBLIC_BASE_URL;

  if (!region || !endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      'Oracle Object Storage environment variables are incomplete. Check OBJECT_STORAGE_* values.',
    );
  }

  return {
    region,
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl,
  };
}

let cachedClient: S3Client | null = null;

export function getObjectStorageBucket(): string {
  return getObjectStorageConfig().bucket;
}

export function getObjectStorageClient(): S3Client {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getObjectStorageConfig();
  cachedClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });

  return cachedClient;
}

function encodeObjectKey(key: string): string {
  return key
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
}

export function buildObjectStorageMediaUrl(objectKey: string): string {
  return `/api/media/${encodeObjectKey(objectKey)}`;
}

function extractObjectKeyFromObjectStorageUrl(urlString: string): string | null {
  try {
    const url = new URL(urlString);
    if (!url.hostname.includes('oraclecloud.com')) {
      return null;
    }

    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (pathSegments.length >= 2 && pathSegments[0] === 'n' && pathSegments[2] === 'b') {
      const objectIndex = pathSegments.indexOf('o');
      if (objectIndex >= 0 && objectIndex < pathSegments.length - 1) {
        return pathSegments.slice(objectIndex + 1).join('/');
      }
    }

    if (pathSegments.length >= 2) {
      return pathSegments.slice(1).join('/');
    }
  } catch {
    return null;
  }

  return null;
}

export function resolveRenderableImageUrl(imageUrl: string | null | undefined, objectKey?: string | null): string {
  if (objectKey) {
    return buildObjectStorageMediaUrl(objectKey);
  }

  if (!imageUrl) {
    return '';
  }

  if (imageUrl.startsWith('/api/media/')) {
    return imageUrl;
  }

  const extractedObjectKey = extractObjectKeyFromObjectStorageUrl(imageUrl);
  if (extractedObjectKey) {
    return buildObjectStorageMediaUrl(extractedObjectKey);
  }

  return imageUrl;
}

export function buildObjectStorageObjectKey(folder: string, fileName: string): string {
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
  return `${normalizedFolder}/${fileName}`;
}

export function buildObjectStoragePublicUrl(objectKey: string): string {
  const objectStorageConfig = getObjectStorageConfig();
  if (objectStorageConfig.publicBaseUrl) {
    return `${objectStorageConfig.publicBaseUrl.replace(/\/+$/, '')}/${encodeObjectKey(objectKey)}`;
  }

  return buildObjectStorageMediaUrl(objectKey);
}
