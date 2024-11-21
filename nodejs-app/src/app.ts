import express from 'express';
import { router as healthRouter } from './routes/health';
import { router as metadataRouter } from './routes/metadata';

export const app = express();
app.disable('x-powered-by');
app.use(express.json());

// Health check route
app.use('/health', healthRouter);

// Metadata route
app.use('/metadata', metadataRouter);

// Root endpoint serving HTML
app.get('/', (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Node.js App - Task 6: Application Deployment via Jenkins Pipeline</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin: 50px;
                }
                h1 {
                    color: #4CAF50;
                }
                p {
                    font-size: 1.2em;
                }
                a {
                    text-decoration: none;
                    color: #007BFF;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to the Node.js App</h1>
            <h3><a href="https://rs.school/courses/aws-devops">RSSchool AWS DevOps Course 🚀</a></h3>
            <p>Task 6: Application Deployment via Jenkins Pipeline.</p>
            <p>
                <a href="/metadata">EC2 Metadata 🕵</a> | 
                <a href="/health">Health Status 💗</a>
            </p>
            <img src="https://rs.school/_next/static/media/rs-slope-aws-dev.219b3d33.webp" width="350" />
        </body>
        </html>
    `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on :${PORT}`);
});
