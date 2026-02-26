import { v2 as cloudinary } from 'cloudinary';
import { UploadOptions, UploadResult } from './types.js';
import { CloudinaryApiError } from './utils/errors.js';

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
