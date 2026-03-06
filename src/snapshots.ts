import { SnapshotInput, SnapshotResult, DetailedSnapshotResult } from './types.js';
import { SnapshotInputSchema } from './validation.js';
import { ValidationError } from './utils/errors.js';
import { generateSnapshotUrl } from './utils/formatters.js';

/**
 * Returns a detailed result including timestamps and their corresponding
 * Cloudinary screenshot URLs.
 * 
 * @param input - { videoUrl, timeStamps, transformation?, duration? }
 * @returns DetailedSnapshotResult with screenshots array.
 */
export async function getSnapshotUrls(input: SnapshotInput): Promise<DetailedSnapshotResult> {
    const validation = SnapshotInputSchema.safeParse(input);

    if (!validation.success) {
        const errorMessages = validation.error.issues.map(i => i.message).join(', ');
        throw new ValidationError(`Invalid input: ${errorMessages}`);
    }

    const { videoUrl, timeStamps, transformation, duration } = validation.data;

    // Optional duration validation
    if (duration !== undefined) {
        const invalidTimestamps = timeStamps.filter(ts => ts > duration);
        if (invalidTimestamps.length > 0) {
            throw new ValidationError(
                `Invalid timestamps: [${invalidTimestamps.join(', ')}]. Video duration is ${duration}s.`
            );
        }
    }

    const screenshots = timeStamps.map(ts => ({
        timestamp: ts,
        url: generateSnapshotUrl(videoUrl, ts, transformation)
    }));

    return {
        screenshots,
        total: screenshots.length
    };
}

/**
 * Generates high-quality screenshot URLs for a Cloudinary video.
 * 
 * @param input The video URL and timestamps.
 * @returns Array of optimized image URLs.
 * @throws ValidationError if input is invalid.
 */
export async function getCloudinarySnapshots(input: SnapshotInput): Promise<SnapshotResult> {
    const detailed = await getSnapshotUrls(input);

    return {
        screenshotUrls: detailed.screenshots.map(s => s.url)
    };
}
