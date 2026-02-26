export { v2 as cloudinary } from 'cloudinary';

/**
 * Configuration options for the Cloudinary Snapshots package.
 */
interface CloudinaryConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
}
/**
 * Input for generating snapshots from a video URL.
 */
interface SnapshotInput {
    videoUrl: string;
    timeStamps: number[];
    transformation?: string;
}
/**
 * Result of the snapshot generation process.
 */
interface SnapshotResult {
    screenshotUrls: string[];
}
/**
 * Options for uploading a video to Cloudinary.
 */
interface UploadOptions {
    folder?: string;
    publicId?: string;
    resourceType?: 'video' | 'auto';
    overwrite?: boolean;
}
/**
 * Result of the video upload.
 */
interface UploadResult {
    secureUrl: string;
    publicId: string;
    duration: number;
    format: string;
}

/**
 * Configure the Cloudinary SDK.
 * @param config Configuration object.
 */
declare function configureCloudinary(config: CloudinaryConfig): any;

/**
 * Uploads a video file to Cloudinary.
 *
 * @param filePath Path to the local file, a URL, or a base64 string.
 * @param options Upload configuration options.
 * @returns Promise with upload result.
 */
declare function uploadVideo(filePath: string, options?: UploadOptions): Promise<UploadResult>;

/**
 * Generates high-quality screenshot URLs for a Cloudinary video.
 *
 * @param input The video URL and timestamps.
 * @returns Array of optimized image URLs.
 * @throws ValidationError if input is invalid.
 */
declare function getCloudinarySnapshots(input: SnapshotInput): Promise<SnapshotResult>;

declare class CloudinarySnapshotError extends Error {
    readonly code: string;
    readonly status?: number | undefined;
    constructor(message: string, code: string, status?: number | undefined);
}
declare class ValidationError extends CloudinarySnapshotError {
    constructor(message: string);
}
declare class CloudinaryApiError extends CloudinarySnapshotError {
    constructor(message: string, status?: number);
}

/**
 * Generates a Cloudinary snapshot URL from a video URL and a timestamp.
 *
 * @param videoUrl The original Cloudinary video URL.
 * @param timeStamp The second at which to take the snapshot.
 * @param transformation Additional image transformations (optional).
 * @returns The formatted snapshot URL.
 */
declare function generateSnapshotUrl(videoUrl: string, timeStamp: number, transformation?: string): string;

export { CloudinaryApiError, type CloudinaryConfig, CloudinarySnapshotError, type SnapshotInput, type SnapshotResult, type UploadOptions, type UploadResult, ValidationError, configureCloudinary, generateSnapshotUrl, getCloudinarySnapshots, uploadVideo };
