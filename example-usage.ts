import { uploadVideoWithSnapshots } from './src/index.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * This example demonstrates the NEW combined flow:
 * 1. Takes user input (Cloudinary Credentials + Video File)
 * 2. Uploads the video TO the user's account
 * 3. Force-generates and STORES snapshots in that same account
 */
async function runFullFlow() {
    try {
        const credentials = {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
            apiKey: process.env.CLOUDINARY_API_KEY || 'your_api_key',
            apiSecret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret',
        };

        const videoPath = 'https://res.cloudinary.com/demo/video/upload/dog.mp4'; // Can be local path, URL, or base64

        console.log('--- Starting Full Flow (Upload + Persistent Snapshots) ---');

        const result = await uploadVideoWithSnapshots(videoPath, {
            config: credentials,
            timestamps: [1, 5, 10],
            folder: 'user_content/videos',
            screenshotTransform: 'w_1080,c_limit,q_auto' // High quality snapshots
        });

        console.log('Video Stored At:', result.video.secureUrl);
        console.log('Snapshots Stored At:');
        result.snapshots.forEach((url, i) => {
            console.log(`[Snapshot ${i}] ${url}`);
        });

    } catch (error) {
        console.error('Flow failed:', error);
    }
}

// runFullFlow();
