import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.OBJECT_STORAGE_REGION;
const endpoint = process.env.OBJECT_STORAGE_ENDPOINT;
const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
const bucket = process.env.OBJECT_STORAGE_BUCKET;

if (!region || !endpoint || !accessKeyId || !secretAccessKey || !bucket) {
  throw new Error(
    'Oracle Object Storage environment variables are incomplete. Check OBJECT_STORAGE_* values.',
  );
}

export const objectStorageBucket = bucket;

export const objectStorageClient = new S3Client({
  region,
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});
