/**
 * Configuration options for the Cloudinary Snapshots package.
 */
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Input for generating snapshots from a video URL.
 */
export interface SnapshotInput {
  videoUrl: string;
  timeStamps: number[];
  transformation?: string;
  duration?: number;
}

export interface SnapshotEntry {
  timestamp: number;
  url: string;
}

/**
 * Result of the snapshot generation process with timestamps.
 */
export interface DetailedSnapshotResult {
  screenshots: SnapshotEntry[];
  total: number;
}

/**
 * Result of the snapshot generation process.
 */
export interface SnapshotResult {
  screenshotUrls: string[];
}

/**
 * Options for uploading a video to Cloudinary.
 */
export interface UploadOptions {
  folder?: string;
  publicId?: string;
  resourceType?: 'video' | 'auto';
  overwrite?: boolean;
}

/**
 * Result of the video upload.
 */
export interface UploadResult {
  secureUrl: string;
  publicId: string;
  duration: number;
  format: string;
}
/**
 * Options for the full flow: Upload video + capture multiple snapshots.
 */
export interface FullFlowOptions extends UploadOptions {
  config: CloudinaryConfig;
  timestamps: number[];
  screenshotTransform?: string;
}

/**
 * Result of the full combined flow.
 */
export interface FullFlowResult {
  video: UploadResult;
  snapshots: string[];
}
