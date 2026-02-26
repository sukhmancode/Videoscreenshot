// src/client.ts
import { v2 as cloudinary } from "cloudinary";

// src/validation.ts
import { z } from "zod";
var CloudinaryConfigSchema = z.object({
  cloudName: z.string().min(1, "cloudName is required"),
  apiKey: z.string().min(1, "apiKey is required"),
  apiSecret: z.string().min(1, "apiSecret is required")
});
var SnapshotInputSchema = z.object({
  videoUrl: z.string().url("Invalid video URL"),
  timeStamps: z.array(z.number().min(0, "Timestamp must be non-negative")).min(1, "At least one timestamp is required"),
  transformation: z.string().optional()
});
var UploadInputSchema = z.object({
  filePath: z.string().min(1, "File path or URL is required"),
  folder: z.string().optional(),
  publicId: z.string().optional()
});

// src/utils/errors.ts
var CloudinarySnapshotError = class _CloudinarySnapshotError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "CloudinarySnapshotError";
    Object.setPrototypeOf(this, _CloudinarySnapshotError.prototype);
  }
};
var ValidationError = class extends CloudinarySnapshotError {
  constructor(message) {
    super(message, "VALIDATION_ERROR", 400);
  }
};
var CloudinaryApiError = class extends CloudinarySnapshotError {
  constructor(message, status) {
    super(message, "CLOUDINARY_API_ERROR", status);
  }
};

// src/client.ts
function configureCloudinary(config) {
  const validation = CloudinaryConfigSchema.safeParse(config);
  if (!validation.success) {
    throw new ValidationError(`Invalid configuration: ${validation.error.message}`);
  }
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true
  });
  return cloudinary;
}

// src/uploader.ts
import { v2 as cloudinary2 } from "cloudinary";
async function uploadVideo(filePath, options = {}) {
  try {
    const result = await cloudinary2.uploader.upload(filePath, {
      resource_type: options.resourceType || "video",
      folder: options.folder,
      public_id: options.publicId,
      overwrite: options.overwrite
    });
    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format
    };
  } catch (error) {
    throw new CloudinaryApiError(
      error.message || "Failed to upload video to Cloudinary",
      error.http_code
    );
  }
}

// src/utils/formatters.ts
function generateSnapshotUrl(videoUrl, timeStamp, transformation = "f_auto,q_auto") {
  let baseUrl = videoUrl.replace(/\.[^/.]+$/, ".jpg");
  const uploadMarker = "/video/upload/";
  if (!baseUrl.includes(uploadMarker)) {
    baseUrl = baseUrl.replace("/video/", "/video/upload/");
  }
  const parts = baseUrl.split(uploadMarker);
  if (parts.length !== 2) {
    return baseUrl;
  }
  const [prefix, suffix] = parts;
  const snapshotTransform = `so_${timeStamp}${transformation ? `,${transformation}` : ""}`;
  return `${prefix}${uploadMarker}${snapshotTransform}/${suffix}`;
}

// src/snapshots.ts
async function getCloudinarySnapshots(input) {
  const validation = SnapshotInputSchema.safeParse(input);
  if (!validation.success) {
    const errorMessages = validation.error.issues.map((i) => i.message).join(", ");
    throw new ValidationError(`Invalid input: ${errorMessages}`);
  }
  const { videoUrl, timeStamps, transformation } = validation.data;
  const screenshotUrls = timeStamps.map(
    (ts) => generateSnapshotUrl(videoUrl, ts, transformation)
  );
  return {
    screenshotUrls
  };
}
export {
  CloudinaryApiError,
  CloudinarySnapshotError,
  ValidationError,
  cloudinary,
  configureCloudinary,
  generateSnapshotUrl,
  getCloudinarySnapshots,
  uploadVideo
};
