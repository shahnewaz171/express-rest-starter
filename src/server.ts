import http from 'node:http';
import cors from 'cors';
import express from 'express';

// Initiating dotenv
import 'dotenv/config';

// Middlewares
import errorHandler from '@/src/middlewares/error.js';

// Routes
import routes from '@/src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Using CORS for cross site origin issue
app.use(cors({ origin: '*' }));

// Using JSON for parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome to Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome To Express.js API Server' });
});

// API Routes
app.use(routes);

// Default route if it does not match to any route
app.use((req, res) => {
  res.status(404).json({ message: 'Router not found' });
});

// Error handling middleware
app.use(errorHandler);

// Server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
