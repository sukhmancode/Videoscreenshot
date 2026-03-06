import { z } from 'zod';

export const CloudinaryConfigSchema = z.object({
    cloudName: z.string().min(1, "cloudName is required"),
    apiKey: z.string().min(1, "apiKey is required"),
    apiSecret: z.string().min(1, "apiSecret is required"),
});

export const SnapshotInputSchema = z.object({
    videoUrl: z.string().url("Invalid video URL"),
    timeStamps: z.array(z.number().min(0, "Timestamp must be non-negative")).min(1, "At least one timestamp is required"),
    duration: z.number().min(0).optional(),
});

export const UploadInputSchema = z.object({
    filePath: z.string().min(1, "File path or URL is required"),
    folder: z.string().optional(),
    publicId: z.string().optional(),
});
