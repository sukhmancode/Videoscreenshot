import express, { Request, Response } from 'express';
import cors from 'cors';
import { getSnapshotUrls } from './src/index.js';
import { ValidationError } from './src/utils/errors.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ── GET / — Hello Endpoint ───────────────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
    res.json({
        name: 'Cloudinary Snapshots API',
        message: 'Send a POST request to /api/snapshots to get video frame URLs.',
        endpoints: {
            postSnapshots: '/api/snapshots'
        }
    });
});

// ── POST /api/snapshots ──────────────────────────────────────────────────
app.post('/api/snapshots', async (req: Request, res: Response) => {
    try {
        const { videoUrl, timeStamps, transformation } = req.body;

        if (!videoUrl || !timeStamps || !Array.isArray(timeStamps)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Missing "videoUrl" or "timeStamps" (array) in request body.'
            });
        }

        const result = await getSnapshotUrls({
            videoUrl,
            timeStamps,
            transformation
        });

        res.json(result);

    } catch (error: any) {
        if (error instanceof ValidationError) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.message
            });
        }

        console.error('API Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message || 'Something went wrong on the server.'
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
