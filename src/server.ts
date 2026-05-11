import http from 'node:http';
import cors from 'cors';
import express from 'express';

import { PORT } from '@/src/utils/env';

// Middlewares
import errorHandler from '@/src/middlewares/error';

// Routes
import routes from '@/src/routes';

// Database connection
import { connectToPostgresDB } from '@/src/db';

// Express Application
const app = express();

// Using CORS for cross site origin issue
app.use(cors({ origin: '*' }));

// Using JSON for parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome to Route
app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Welcome To Express.js API Server' });
});

// API Routes
app.use(routes);

// Default route if it does not match to any route
app.use((_req, res) => {
  res.status(404).json({ message: 'Router not found' });
});

// Error handling middleware
app.use(errorHandler);

// Server
const server = http.createServer(app);

connectToPostgresDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('server', 'Something went wrong, error:', err);
  });
