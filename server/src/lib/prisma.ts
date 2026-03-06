/**
 * Prisma singleton — ensures a single PrismaClient instance across the process.
 * Refined for production scalability and reliability.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../middleware/logger.js';

const isProd = process.env.NODE_ENV === 'production';

// Connection pooling and retry configuration for serverless environments
// Cloud Run can scale rapidly; we must control connection overhead.
const prisma = new PrismaClient({
    datasources: process.env.DATABASE_URL ? {
        db: {
            url: process.env.DATABASE_URL,
        },
    } : undefined,
    log: isProd
        ? [
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
        ]
        : [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'info' },
            { emit: 'event', level: 'warn' },
            { emit: 'event', level: 'error' },
        ],
});

// Structured logging handlers
prisma.$on('error', (e: any) => {
    logger.error({
        severity: 'ERROR',
        component: 'prisma',
        target: e.target,
        message: isProd ? 'Database error occurred' : e.message,
    });
});

prisma.$on('warn', (e: any) => {
    logger.warn({
        severity: 'WARNING',
        component: 'prisma',
        target: e.target,
        message: e.message,
    });
});

if (!isProd) {
    (prisma as any).$on('query', (e: any) => {
        logger.debug({
            component: 'prisma:query',
            duration: `${e.duration}ms`,
            query: e.query,
            params: e.params,
        });
    });
}

export default prisma;
