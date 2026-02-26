import { FullFlowOptions, FullFlowResult, UploadOptions, UploadResult } from './types.js';
import { CloudinaryApiError, ValidationError } from './utils/errors.js';
import { configureCloudinary, cloudinary } from './client.js';
import { generateSnapshotUrl } from './utils/formatters.js';

/**
 * Uploads a video file to Cloudinary.
 * 
 * @param filePath Path to the local file, a URL, or a base64 string.
 * @param options Upload configuration options.
 * @returns Promise with upload result.
 */
export async function uploadVideo(
    filePath: string,
    options: UploadOptions = {}
): Promise<UploadResult> {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: options.resourceType || 'video',
            folder: options.folder,
            public_id: options.publicId,
            overwrite: options.overwrite,
        });

        return {
            secureUrl: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
            format: result.format,
        };
    } catch (error: any) {
        throw new CloudinaryApiError(
            error.message || 'Failed to upload video to Cloudinary',
            error.http_code
        );
    }
}

/**
 * Handles the full flow: Setup config, Upload Video, and Generate/Store Snapshots as standalone images.
 * 
 * @param filePath The video file to upload.
 * @param options Full flow options including credentials and timestamps.
 */
export async function uploadVideoWithSnapshots(
    filePath: string,
    options: FullFlowOptions
): Promise<FullFlowResult> {
    // 1. Configure Cloudinary dynamically
    configureCloudinary(options.config);

    try {
        // 2. Upload video first to get duration and metadata
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video',
            folder: options.folder,
            public_id: options.publicId,
            overwrite: options.overwrite,
        });

        const duration = uploadResult.duration;

        // 3. Validate timestamps against actual video duration
        const invalidTimestamps = options.timestamps.filter(ts => ts > duration);
        if (invalidTimestamps.length > 0) {
            throw new ValidationError(
                `Invalid timestamps: [${invalidTimestamps.join(', ')}]. Video duration is only ${duration} seconds.`
            );
        }

        // 4. Generate snapshot URLs and upload them as standalone image assets
        const snapshotUploadPromises = options.timestamps.map(async (ts) => {
            const snapUrl = generateSnapshotUrl(uploadResult.secure_url, ts, options.screenshotTransform);

            // Upload the generated snapshot URL back to Cloudinary as an IMAGE
            const snapUpload = await cloudinary.uploader.upload(snapUrl, {
                resource_type: 'image',
                folder: options.folder ? `${options.folder}/snapshots` : 'snapshots',
                public_id: `${uploadResult.publicId.split('/').pop()}_snap_${ts}`,
                overwrite: true
            });

            return snapUpload.secure_url;
        });

        const snapshots = await Promise.all(snapshotUploadPromises);

        return {
            video: {
                secureUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                duration: uploadResult.duration,
                format: uploadResult.format,
            },
            snapshots
        };
    } catch (error: any) {
        if (error.code === 'VALIDATION_ERROR') throw error;
        throw new CloudinaryApiError(
            error.message || 'Full flow failed',
            error.http_code
        );
    }
}
