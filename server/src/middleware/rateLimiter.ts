import rateLimit from 'express-rate-limit';

// Global rate limiter to prevent basic DoS and brute force
export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes',
        code: 'RATE_LIMIT_EXCEEDED',
    },
});

// Stricter rate limiter for authentication/sensitive routes
export const authRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Very high for dev/audit
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again after an hour',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
});
