import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  type _Object,
} from '@aws-sdk/client-s3';
import { dbQuery } from '@/lib/database';
import { getObjectStorageBucket, getObjectStorageClient } from '@/lib/objectStorage';

type CleanupOptions = {
  trigger?: string;
  maxDeletesPerRun?: number;
};

type ReferenceSpec = {
  table: string;
  column: string;
  kind: 'text' | 'json-array-object-key';
};

const DEFAULT_MAX_DELETES_PER_RUN = 200;
const DEFAULT_ORPHAN_GRACE_MINUTES = 180;

const REFERENCE_SPECS: ReferenceSpec[] = [
  { table: 'profiles', column: 'avatar_object_key', kind: 'text' },
  { table: 'talent_profiles', column: 'profile_picture_object_key', kind: 'text' },
  { table: 'talent_profiles', column: 'portrait_picture_object_key', kind: 'text' },
  { table: 'talent_profiles', column: 'portrait_pictures', kind: 'json-array-object-key' },
  { table: 'artist_profiles', column: 'portfolio_art_images', kind: 'json-array-object-key' },
  { table: 'portfolio_art_images', column: 'image_object_key', kind: 'text' },
  { table: 'portfolio_art', column: 'image_object_key', kind: 'text' },
  { table: 'merchandise', column: 'image_object_key', kind: 'text' },
  { table: 'events', column: 'image_object_key', kind: 'text' },
  { table: 'gallery_items', column: 'image_object_key', kind: 'text' },
  { table: 'gallery_media', column: 'media_object_key', kind: 'text' },
  { table: 'homepage_hero_media', column: 'media_object_key', kind: 'text' },
];

async function tableAndColumnExist(table: string, column: string): Promise<boolean> {
  const result = await dbQuery(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
    `,
    [table, column],
  );

  return result.rows.length > 0;
}

async function loadReferencedObjectKeys(): Promise<Set<string>> {
  const referenced = new Set<string>();

  for (const spec of REFERENCE_SPECS) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await tableAndColumnExist(spec.table, spec.column);
    if (!exists) {
      continue;
    }

    if (spec.kind === 'text') {
      // eslint-disable-next-line no-await-in-loop
      const result = await dbQuery(
        `
          SELECT DISTINCT ${spec.column} AS object_key
          FROM ${spec.table}
          WHERE ${spec.column} IS NOT NULL
            AND BTRIM(${spec.column}) <> ''
        `,
      );

      for (const row of result.rows as Array<{ object_key: string }>) {
        referenced.add(String(row.object_key).trim());
      }
      continue;
    }

    // json-array-object-key
    // eslint-disable-next-line no-await-in-loop
    const result = await dbQuery(
      `
        SELECT DISTINCT elem->>'object_key' AS object_key
        FROM ${spec.table}, LATERAL jsonb_array_elements(COALESCE(${spec.column}, '[]'::jsonb)) AS elem
        WHERE elem ? 'object_key'
          AND BTRIM(COALESCE(elem->>'object_key', '')) <> ''
      `,
    );

    for (const row of result.rows as Array<{ object_key: string }>) {
      referenced.add(String(row.object_key).trim());
    }
  }

  return referenced;
}

async function listAllObjects(): Promise<_Object[]> {
  const client = getObjectStorageClient();
  const bucket = getObjectStorageBucket();

  const objects: _Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    );

    if (response.Contents?.length) {
      objects.push(...response.Contents);
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return objects;
}

export async function cleanupUnlinkedObjectStorageMedia(options: CleanupOptions = {}): Promise<{ deleted: number; scanned: number }> {
  const maxDeletesPerRun = options.maxDeletesPerRun ?? DEFAULT_MAX_DELETES_PER_RUN;
  const graceMinutes = Number(process.env.OBJECT_STORAGE_ORPHAN_GRACE_MINUTES || DEFAULT_ORPHAN_GRACE_MINUTES);
  const graceMs = Math.max(1, graceMinutes) * 60_000;
  const safeCutoff = Date.now() - graceMs;

  const referencedKeys = await loadReferencedObjectKeys();
  const objects = await listAllObjects();

  const orphanKeys = objects
    .filter((item) => item.Key && !referencedKeys.has(item.Key))
    .filter((item) => item.LastModified && item.LastModified.getTime() < safeCutoff)
    .map((item) => item.Key as string)
    .slice(0, maxDeletesPerRun);

  if (orphanKeys.length === 0) {
    return { deleted: 0, scanned: objects.length };
  }

  const client = getObjectStorageClient();
  const bucket = getObjectStorageBucket();

  for (let i = 0; i < orphanKeys.length; i += 1000) {
    const chunk = orphanKeys.slice(i, i + 1000);
    // eslint-disable-next-line no-await-in-loop
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: chunk.map((key) => ({ Key: key })),
          Quiet: true,
        },
      }),
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info('[object-storage-cleanup] completed', {
      trigger: options.trigger || 'unknown',
      scanned: objects.length,
      deleted: orphanKeys.length,
      graceMinutes,
    });
  }

  return { deleted: orphanKeys.length, scanned: objects.length };
}
