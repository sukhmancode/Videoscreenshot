import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryConfig } from './types.js';
import { CloudinaryConfigSchema } from './validation.js';
import { ValidationError } from './utils/errors.js';

/**
 * Configure the Cloudinary SDK.
 * @param config Configuration object.
 */
export function configureCloudinary(config: CloudinaryConfig) {
    const validation = CloudinaryConfigSchema.safeParse(config);

    if (!validation.success) {
        throw new ValidationError(`Invalid configuration: ${validation.error.message}`);
    }

    cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret,
        secure: true,
    });

    return cloudinary;
}

export { cloudinary };
