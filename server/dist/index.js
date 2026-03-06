/**
 * NeuraTrade API — Production Entry Point
 *
 * Hardened for Google Cloud Run (asia-south1)
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import compression from 'compression';
import dbRoutes from './routes/dbRoutes.js';
import { setupWebSockets } from './websocket.js';
import prisma from './lib/prisma.js';
// Middlewares
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { BrokerService } from './services/BrokerService.js';
import { verificationEngine } from './services/TradeVerificationEngine.js';
dotenv.config();
// Initialize Integrations & Background Engines
BrokerService.initialize();
verificationEngine.start();
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 8080;
const app = express();
app.set('trust proxy', 1); // Required for rate limiting behind Cloud Run proxy
const server = http.createServer(app);
// ---------------------------------------------------------------------------
// Security & Basic Config
// ---------------------------------------------------------------------------
// 1. Helmet for secure headers
app.use(helmet({
    contentSecurityPolicy: isProd ? undefined : false,
    crossOriginEmbedderPolicy: isProd,
}));
app.use(compression());
// 2. Disable identifying headers
app.disable('x-powered-by');
// 3. CORS lockdown
app.use(cors({
    origin: isProd
        ? [process.env.ALLOWED_ORIGIN || 'https://neuratrade.in']
        : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // 24 hours
}));
// 4. Rate Limiting
app.use(globalRateLimiter);
// 5. Body Parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// 6. Logging (Morgan for request summary, Pino for details)
app.use(morgan(isProd ? 'combined' : 'dev', {
    stream: { write: (message) => logger.info(message.trim()) }
}));
// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
import apiRoutes from './routes/apiRoutes.js';
// ... (previous imports)
// Apply stricter rate limiting to auth routes
app.use('/api', apiRoutes);
app.use('/db-check', dbRoutes);
/**
 * Liveness Probe (Health)
 * Fast check to see if the process is alive.
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});
/**
 * Readiness Probe
 * Verifies if the service is ready to accept traffic (e.g., DB is up).
 */
app.get('/ready', async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'ready',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error({ msg: 'Readiness probe failed', error });
        res.status(503).json({
            status: 'not_ready',
            database: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * Uptime/Metrics Hook
 */
app.get('/api/metrics', (req, res) => {
    res.status(200).json({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        timestamp: new Date().toISOString()
    });
});
app.get('/', (req, res) => {
    res.json({ service: 'NeuraTrade API', version: '1.0.0-hardened' });
});
// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------
// 404
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Not found', code: 'NOT_FOUND' });
});
// Centralized Error Handler
app.use(errorHandler);
// ---------------------------------------------------------------------------
// Lifecycle Management
// ---------------------------------------------------------------------------
async function gracefulShutdown(signal) {
    logger.info({ msg: `Received ${signal}, starting graceful shutdown`, signal });
    // 1. Close HTTP server (stop accepting new requests)
    server.close(async () => {
        logger.info('HTTP server closed');
        try {
            // 2. Close DB connections
            await prisma.$disconnect();
            logger.info('Database connections closed');
            process.exit(0);
        }
        catch (err) {
            logger.error({ msg: 'Error during shutdown', err });
            process.exit(1);
        }
    });
    // Force shutdown after 10s (Cloud Run standard timeout window)
    setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
    }, 10000);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
setupWebSockets(server);
server.listen(PORT, () => {
    logger.info({
        msg: `🚀 NeuraTrade API running in ${process.env.NODE_ENV || 'development'} mode`,
        port: PORT,
        node: process.version,
        env: process.env.NODE_ENV
    });
});
