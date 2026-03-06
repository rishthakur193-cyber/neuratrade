import pino from 'pino';
const isProd = process.env.NODE_ENV === 'production';
// Structured logger configured for Cloud Run
export const logger = pino({
    level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
    formatters: {
        level: (label) => {
            // Mapping levels to severity for Cloud Run / Stackdriver
            // Default: 10:trace, 20:debug, 30:info, 40:warn, 50:error, 60:fatal
            const severityMap = {
                trace: 'DEBUG',
                debug: 'DEBUG',
                info: 'INFO',
                warn: 'WARNING',
                error: 'ERROR',
                fatal: 'CRITICAL',
            };
            return { severity: severityMap[label] || 'INFO' };
        },
    },
    // In development, use pino-pretty for human-readable output
    transport: isProd
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        },
    timestamp: pino.stdTimeFunctions.isoTime,
});
