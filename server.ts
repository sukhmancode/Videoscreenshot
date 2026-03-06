import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { getSnapshotUrls } from './src/index.js';
import { ValidationError } from './src/utils/errors.js';

const app = express();
const port = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cloudinary Snapshots API',
            version: '1.0.0',
            description: 'API to capture and get frames from video URLs using Cloudinary snapshots.',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Local development server',
            },
        ],
    },
    apis: ['./server.ts'], // Pointing to this file for JSDoc annotations
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cors());
app.use(express.json());

/**
 * @openapi
 * /:
 *   get:
 *     summary: API Hello Endpoint
 *     description: Returns basic information about the Cloudinary Snapshots API.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 message:
 *                   type: string
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     postSnapshots:
 *                       type: string
 */
app.get('/', (req: Request, res: Response) => {
    res.json({
        name: 'Cloudinary Snapshots API',
        message: 'Send a POST request to /api/snapshots to get video frame URLs.',
        endpoints: {
            postSnapshots: '/api/snapshots'
        }
    });
});

/**
 * @openapi
 * /api/snapshots:
 *   post:
 *     summary: Capture video snapshots
 *     description: Generates URLs for snapshots captured at specific timestamps from a video URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoUrl
 *               - timeStamps
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 description: The URL of the video to process.
 *                 example: "https://res.cloudinary.com/demo/video/upload/dog.mp4"
 *               timeStamps:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array of seconds where snapshots should be taken.
 *                 example: [1, 5, 10]
 *               transformation:
 *                 type: string
 *                 description: Cloudinary image transformation string to apply to the snapshots.
 *                 example: "w_300,h_200,c_fill"
 *     responses:
 *       200:
 *         description: Successfully generated snapshots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 screenshotUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad Request or Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 */
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
