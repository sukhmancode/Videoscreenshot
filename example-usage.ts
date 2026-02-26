import { configureCloudinary, uploadVideo, getCloudinarySnapshots } from './src/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function runExample() {
    try {
        // 1. Initialize
        configureCloudinary({
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
            apiKey: process.env.CLOUDINARY_API_KEY || '',
            apiSecret: process.env.CLOUDINARY_API_SECRET || '',
        });

        console.log('--- Uploading Video ---');
        // 2. Upload (Optional)
        // Note: You can skip this if you already have a Cloudinary video URL
        // const upload = await uploadVideo('./path/to/video.mp4', { folder: 'previews' });
        // console.log('Uploaded:', upload.secureUrl);

        const mockVideoUrl = 'https://res.cloudinary.com/demo/video/upload/dog.mp4';

        console.log('--- Generating Snapshots ---');
        // 3. Generate Screenshot URLs
        const result = await getCloudinarySnapshots({
            videoUrl: mockVideoUrl,
            timeStamps: [2, 5, 10, 15],
            transformation: 'w_500,h_300,c_fill,g_auto,f_webp' // Optional: Custom transformations
        });

        console.log('Screenshot URLs:');
        result.screenshotUrls.forEach((url, i) => {
            console.log(`[${i}] ${url}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// runExample();
