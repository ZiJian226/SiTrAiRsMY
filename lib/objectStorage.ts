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

const objectStorageConfig = getObjectStorageConfig();

export const objectStorageBucket = objectStorageConfig.bucket;

export const objectStorageClient = new S3Client({
  region: objectStorageConfig.region,
  endpoint: objectStorageConfig.endpoint,
  credentials: {
    accessKeyId: objectStorageConfig.accessKeyId,
    secretAccessKey: objectStorageConfig.secretAccessKey,
  },
  forcePathStyle: true,
});

function encodeObjectKey(key: string): string {
  return key
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
}

export function buildObjectStorageObjectKey(folder: string, fileName: string): string {
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
  return `${normalizedFolder}/${fileName}`;
}

export function buildObjectStoragePublicUrl(objectKey: string): string {
  const encodedKey = encodeObjectKey(objectKey);
  const base = objectStorageConfig.publicBaseUrl || `${objectStorageConfig.endpoint}/${objectStorageConfig.bucket}`;
  return `${base.replace(/\/+$/, '')}/${encodedKey}`;
}
