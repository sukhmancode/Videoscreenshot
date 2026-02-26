"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CloudinaryApiError: () => CloudinaryApiError,
  CloudinarySnapshotError: () => CloudinarySnapshotError,
  ValidationError: () => ValidationError,
  cloudinary: () => import_cloudinary.v2,
  configureCloudinary: () => configureCloudinary,
  generateSnapshotUrl: () => generateSnapshotUrl,
  getCloudinarySnapshots: () => getCloudinarySnapshots,
  uploadVideo: () => uploadVideo
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var import_cloudinary = require("cloudinary");

// src/validation.ts
var import_zod = require("zod");
var CloudinaryConfigSchema = import_zod.z.object({
  cloudName: import_zod.z.string().min(1, "cloudName is required"),
  apiKey: import_zod.z.string().min(1, "apiKey is required"),
  apiSecret: import_zod.z.string().min(1, "apiSecret is required")
});
var SnapshotInputSchema = import_zod.z.object({
  videoUrl: import_zod.z.string().url("Invalid video URL"),
  timeStamps: import_zod.z.array(import_zod.z.number().min(0, "Timestamp must be non-negative")).min(1, "At least one timestamp is required"),
  transformation: import_zod.z.string().optional()
});
var UploadInputSchema = import_zod.z.object({
  filePath: import_zod.z.string().min(1, "File path or URL is required"),
  folder: import_zod.z.string().optional(),
  publicId: import_zod.z.string().optional()
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
  import_cloudinary.v2.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true
  });
  return import_cloudinary.v2;
}

// src/uploader.ts
var import_cloudinary2 = require("cloudinary");
async function uploadVideo(filePath, options = {}) {
  try {
    const result = await import_cloudinary2.v2.uploader.upload(filePath, {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CloudinaryApiError,
  CloudinarySnapshotError,
  ValidationError,
  cloudinary,
  configureCloudinary,
  generateSnapshotUrl,
  getCloudinarySnapshots,
  uploadVideo
});
