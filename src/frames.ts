import { generateSnapshotUrl } from './utils/formatters.js';
import { ValidationError, CloudinaryApiError } from './utils/errors.js';
import { SnapshotInputSchema } from './validation.js';
import { SnapshotInput } from './types.js';

/**
 * Represents a single fetched frame at a specific timestamp.
 */
export interface FrameResult {
    /** Timestamp in seconds at which this frame was captured. */
    timestamp: number;
    /** The raw image data as a Buffer. */
    data: Buffer;
    /** The MIME content type of the image (e.g. "image/jpeg"). */
    contentType: string;
    /** The resolved Cloudinary snapshot URL used to fetch the frame. */
    url: string;
}

/**
 * The full result returned by `getFrames`.
 */
export interface GetFramesResult {
    /** Array of successfully fetched frames, in order of input timestamps. */
    frames: FrameResult[];
    /** Total number of timestamps requested. */
    total: number;
}

/**
 * Fetches actual image frame data from a Cloudinary video at the given timestamps.
 *
 * For each timestamp, a Cloudinary snapshot URL is generated, then fetched over
 * HTTP to retrieve the raw image bytes.
 *
 * @param input - `{ videoUrl, timeStamps, transformation?, duration? }`
 * @returns A promise resolving to an array of `FrameResult` objects containing
 *          the image buffer, content type, timestamp, and source URL.
 * @throws {ValidationError}    If the input is invalid or timestamps exceed duration.
 * @throws {CloudinaryApiError} If any frame fails to fetch.
 *
 * @example
 * ```ts
 * import { getFrames } from 'your-package';
 *
 * const result = await getFrames({
 *   videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1234/sample.mp4',
 *   timeStamps: [0, 5, 10, 30],
 * });
 *
 * for (const frame of result.frames) {
 *   console.log(`Frame at ${frame.timestamp}s → ${frame.url}`);
 *   // frame.data is a Buffer you can save, stream, or encode as base64
 * }
 * ```
 */
export async function getFrames(input: SnapshotInput): Promise<GetFramesResult> {
    // ── 1. Validate input ─────────────────────────────────────────────────────
    const validation = SnapshotInputSchema.safeParse(input);
    if (!validation.success) {
        const errorMessages = validation.error.issues.map(i => i.message).join(', ');
        throw new ValidationError(`Invalid input: ${errorMessages}`);
    }

    const { videoUrl, timeStamps, transformation, duration } = validation.data;

    // ── 2. Optional duration guard ────────────────────────────────────────────
    if (duration !== undefined) {
        const invalid = timeStamps.filter(ts => ts > duration);
        if (invalid.length > 0) {
            throw new ValidationError(
                `Invalid timestamps: [${invalid.join(', ')}]. Video duration is ${duration}s.`
            );
        }
    }

    // ── 3. Build snapshot URLs ────────────────────────────────────────────────
    const entries = timeStamps.map(ts => ({
        timestamp: ts,
        url: generateSnapshotUrl(videoUrl, ts, transformation),
    }));

    // ── 4. Fetch all frames in parallel ───────────────────────────────────────
    const fetchFrame = async (entry: { timestamp: number; url: string }): Promise<FrameResult> => {
        let response: Response;
        try {
            response = await fetch(entry.url);
        } catch (err: any) {
            throw new CloudinaryApiError(
                `Network error fetching frame at ${entry.timestamp}s: ${err.message}`
            );
        }

        if (!response.ok) {
            throw new CloudinaryApiError(
                `Failed to fetch frame at ${entry.timestamp}s — HTTP ${response.status} ${response.statusText}`,
                response.status
            );
        }

        const contentType = response.headers.get('content-type') ?? 'image/jpeg';
        const arrayBuffer = await response.arrayBuffer();
        const data = Buffer.from(arrayBuffer);

        return {
            timestamp: entry.timestamp,
            data,
            contentType,
            url: entry.url,
        };
    };

    const frames = await Promise.all(entries.map(fetchFrame));

    return {
        frames,
        total: frames.length,
    };
}
