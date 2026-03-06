import { getSnapshotUrls } from './src/index.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

async function runInteractive() {
    console.log('--- Cloudinary Snapshot CLI ---');

    try {
        // 1. Get Video URL from user
        const videoUrl = await askQuestion('Enter Cloudinary Video URL: ');
        if (!videoUrl) {
            console.error('URL is required!');
            process.exit(1);
        }

        // 2. Get Timestamps from user
        const timeInput = await askQuestion('Enter frame seconds (comma-separated, e.g. 1, 3.5, 7): ');
        const timestamps = timeInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

        if (timestamps.length === 0) {
            console.error('At least one valid timestamp is required!');
            process.exit(1);
        }

        console.log('\nGenerating URLs...');

        // 3. Call the API
        const result = await getSnapshotUrls({
            videoUrl,
            timeStamps: timestamps,
            transformation: 'f_auto,q_auto' // Default optimization
        });

        // 4. Output in array form as requested
        console.log('\n--- Result Array ---');
        console.log(JSON.stringify(result.screenshots, null, 2));

        console.log(`\nTotal: ${result.total} screenshots generated.`);

    } catch (error: any) {
        console.error('\nError:', error.message);
    } finally {
        rl.close();
    }
}

runInteractive();
