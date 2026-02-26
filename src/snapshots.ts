import { SnapshotInput, SnapshotResult } from './types.js';
import { SnapshotInputSchema } from './validation.js';
import { ValidationError } from './utils/errors.js';
import { generateSnapshotUrl } from './utils/formatters.js';

/**
 * Generates high-quality screenshot URLs for a Cloudinary video.
 * 
 * @param input The video URL and timestamps.
 * @returns Array of optimized image URLs.
 * @throws ValidationError if input is invalid.
 */
export async function getCloudinarySnapshots(input: SnapshotInput): Promise<SnapshotResult> {
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

    const screenshotUrls = timeStamps.map(ts =>
        generateSnapshotUrl(videoUrl, ts, transformation)
    );

    return {
        screenshotUrls
    };
}
