/**
 * /db-check route
 *
 * Security principles applied:
 * - No credentials, DSN, or stack traces in ANY response body (production or dev)
 * - No table data returned — only a scalar `SELECT 1` result
 * - 5-second hard timeout via Promise.race to prevent hanging connections
 *   blocking the Cloud Run request queue
 * - Error detail scoped to NODE_ENV — in production, only a generic message
 *   is returned so internal DB topology is never leaked
 */
import { Router } from 'express';
import prisma from '../lib/prisma.js';
const router = Router();
const isProd = process.env.NODE_ENV === 'production';
const DB_TIMEOUT_MS = 5_000;
router.get('/', async (_req, res) => {
    const started = Date.now();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), DB_TIMEOUT_MS));
    const checkPromise = prisma.$queryRaw `SELECT 1`;
    try {
        await Promise.race([checkPromise, timeoutPromise]);
        const latencyMs = Date.now() - started;
        // Structured log for Cloud Run — safe, no credentials
        console.log(JSON.stringify({
            severity: 'INFO',
            component: 'db-check',
            status: 'ok',
            latencyMs,
            timestamp: new Date().toISOString(),
        }));
        res.status(200).json({
            status: 'ok',
            database: 'connected',
            latencyMs,
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        const latencyMs = Date.now() - started;
        const isTimeout = err instanceof Error && err.message === 'DB_TIMEOUT';
        // Always log the real error server-side for ops visibility
        console.error(JSON.stringify({
            severity: 'ERROR',
            component: 'db-check',
            status: isTimeout ? 'timeout' : 'error',
            latencyMs,
            // In prod we skip error.message — it may contain partial DSN segment
            detail: isProd ? undefined : (err instanceof Error ? err.message : String(err)),
            timestamp: new Date().toISOString(),
        }));
        // Response body: NEVER expose stack traces, DSN, or error internals
        res.status(503).json({
            status: isTimeout ? 'timeout' : 'error',
            database: 'unreachable',
            latencyMs,
            message: isTimeout
                ? 'Database did not respond within 5 seconds.'
                : 'Database connection check failed.',
            timestamp: new Date().toISOString(),
        });
    }
});
export default router;
