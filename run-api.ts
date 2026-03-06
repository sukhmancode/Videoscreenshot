import { getFrames } from './src/index.js';
import fs from 'fs';
import path from 'path';

/**
 * This script demonstrates how to run the new getFrames API function.
 * It takes a video URL and timestamps, and returns the frame data.
 */
async function runGetFrames() {
    console.log('--- Running getFrames API ---');

    // 1. Define your input (publicly accessible Cloudinary video URL)
    const videoUrl = 'https://res.cloudinary.com/demo/video/upload/dog.mp4';
    const timestamps = [1, 3.5, 7]; // seconds

    try {
        // 2. Call the API function
        // Note: It returns URLs AND the raw image Buffers
        const result = await getFrames({
            videoUrl,
            timeStamps: timestamps,
            transformation: 'w_640,c_scale' // Optional: resize frames
        });

        console.log(`Successfully generated ${result.total} frames.\n`);

        // Create a directory to save the frames locally (just for demonstration)
        const outputDir = path.join(process.cwd(), 'output_frames');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        // 3. Process the results
        result.frames.forEach((frame, index) => {
            console.log(`[Frame ${index}] at ${frame.timestamp}s`);
            console.log(`URL: ${frame.url}`);

            // Save the buffer to a file to show it works
            const fileName = `frame_${frame.timestamp}s.jpg`;
            const filePath = path.join(outputDir, fileName);
            fs.writeFileSync(filePath, frame.data);

            console.log(`Saved to: ${filePath}\n`);
        });

        console.log('--- Done! Check the /output_frames folder ---');

    } catch (error) {
        console.error('Error running getFrames:', error);
    }
}

runGetFrames();
