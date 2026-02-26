import { uploadVideoWithSnapshots } from './src/index.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('Testing upload with:', process.env.CLOUDINARY_CLOUD_NAME);
    try {
        const result = await uploadVideoWithSnapshots('https://res.cloudinary.com/demo/video/upload/dog.mp4', {
            config: {
                cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
                apiKey: process.env.CLOUDINARY_API_KEY || '',
                apiSecret: process.env.CLOUDINARY_API_SECRET || '',
            },
            timestamps: [1, 2],
            folder: 'test_snapshots'
        });
        console.log('Upload Success!');
        console.log('Video:', result.video.secureUrl);
        console.log('Snapshots:', result.snapshots);
    } catch (e) {
        console.error('Upload Failed:', e);
    }
}

test();
