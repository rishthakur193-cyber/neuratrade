import { Storage } from '@google-cloud/storage';
import path from 'path';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';

const useGCS = !!(
    process.env.GCS_BUCKET_NAME &&
    process.env.GOOGLE_APPLICATION_CREDENTIALS
);

const storage = useGCS ? new Storage() : null;
const bucket = useGCS ? storage!.bucket(process.env.GCS_BUCKET_NAME!) : null;

/**
 * Uploads a file buffer to either Google Cloud Storage (if configured)
 * or falls back to secure local disk storage (staging/dev fallback).
 *
 * @returns The publicly-accessible GCS URL or local path.
 */
export async function uploadFile({
    buffer,
    originalName,
    mimeType,
    folder = 'uploads',
    userId,
}: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder?: string;
    userId: string;
}): Promise<string> {
    const ext = path.extname(originalName);
    const safeFilename = `${folder}/${userId}_${randomUUID()}${ext}`;

    if (useGCS && bucket) {
        const file = bucket.file(safeFilename);

        await file.save(buffer, {
            metadata: { contentType: mimeType },
            resumable: false,
        });

        // Make file private — only accessible via signed URL
        await file.makePrivate();

        console.log(`[GCS] Uploaded: gs://${process.env.GCS_BUCKET_NAME}/${safeFilename}`);
        return `gs://${process.env.GCS_BUCKET_NAME}/${safeFilename}`;
    }

    // Local fallback for staging environments without GCS
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });
    const localPath = path.join(uploadDir, `${userId}_${randomUUID()}${ext}`);
    await fs.writeFile(localPath, buffer);
    console.warn(`[LOCAL STORAGE FALLBACK] File saved to: ${localPath}`);
    return localPath;
}

/**
 * Generates a signed URL for secure, time-limited file access.
 * Only works when GCS is configured.
 */
export async function getSignedUrl(gcsPath: string, expiresInMinutes = 15): Promise<string | null> {
    if (!useGCS || !bucket) {
        return null;
    }

    const filename = gcsPath.replace(`gs://${process.env.GCS_BUCKET_NAME}/`, '');
    const [url] = await bucket.file(filename).getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000,
    });

    return url;
}
