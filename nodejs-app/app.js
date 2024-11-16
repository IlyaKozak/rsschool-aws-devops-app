import express from 'express';
import { router as healthRouter } from './routes/health.js';

const app = express();
app.use(express.json());

// Health check route
app.use('/health', healthRouter);

// Root endpoint serving HTML
app.get('/', (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Node.js Kubernetes App</title>
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
            <h1>Welcome to the Node.js Kubernetes App</h1>
            <p>This application is running in a Kubernetes cluster.</p>
            <p>
                <a href="/health">Check Health Status</a>
            </p>
        </body>
        </html>
    `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on :${PORT}`);
});
