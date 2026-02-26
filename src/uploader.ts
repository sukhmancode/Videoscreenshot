import { FullFlowOptions, FullFlowResult, UploadOptions, UploadResult } from './types.js';
import { CloudinaryApiError } from './utils/errors.js';
import { configureCloudinary, cloudinary } from './client.js';

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
 * Handles the full flow: Setup config, Upload Video, and Generate/Store Snapshots.
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
        // 2. Prepare eager transformations (each timestamp is a screenshot)
        const eagerTransformations = options.timestamps.map(ts => ({
            start_offset: ts,
            format: 'jpg',
            transformation: options.screenshotTransform || 'f_auto,q_auto'
        }));

        // 3. Upload with eager transformations
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video',
            folder: options.folder,
            public_id: options.publicId,
            overwrite: options.overwrite,
            eager: eagerTransformations,
            eager_async: false // Set to true for long videos if needed
        });

        // 4. Map eager results to URLs
        const snapshots = result.eager ? result.eager.map((e: any) => e.secure_url) : [];

        return {
            video: {
                secureUrl: result.secure_url,
                publicId: result.public_id,
                duration: result.duration,
                format: result.format,
            },
            snapshots
        };
    } catch (error: any) {
        throw new CloudinaryApiError(
            error.message || 'Full flow failed',
            error.http_code
        );
    }
}
