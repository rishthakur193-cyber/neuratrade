import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

import http from 'http';
import { setupWebSockets } from './websocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Ecosystem Server is running' });
});

// Hello World
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Ecosystem of Smart Investing API' });
});

// Initialize WebSockets
setupWebSockets(server);

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket stream active on ws://localhost:${PORT}`);
});
