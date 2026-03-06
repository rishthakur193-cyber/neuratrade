import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

const isProd = process.env.NODE_ENV === 'production';

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = isProd && statusCode === 500 ? 'Internal server error' : err.message;

    // Log the complete error server-side
    logger.error({
        msg: err.message,
        stack: isProd ? undefined : err.stack,
        path: req.path,
        method: req.method,
        statusCode,
        errorCode: err.code,
    });

    res.status(statusCode).json({
        status: 'error',
        message,
        code: err.code || 'INTERNAL_ERROR',
        ...(isProd ? {} : { stack: err.stack }),
    });
};

// Graceful rejection handler for unhandled promises
process.on('unhandledRejection', (reason: Error) => {
    logger.fatal({
        msg: 'Unhandled Rejection',
        reason: reason.message,
        stack: reason.stack,
    });
    // In production, we might want to shut down gracefully after some cleanup
    // handleGracefulShutdown();
});

process.on('uncaughtException', (err: Error) => {
    logger.fatal({
        msg: 'Uncaught Exception',
        error: err.message,
        stack: err.stack,
    });
    process.exit(1);
});
