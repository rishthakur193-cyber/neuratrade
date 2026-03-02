import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'super-secret-key-change-in-production-ecosystem-2026';
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Basic in-memory rate limiter for Edge Runtime
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_AUTH_REQUESTS = 5; // 5 requests per minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return false;
    }

    if (record.count >= MAX_AUTH_REQUESTS) {
        return true;
    }

    record.count++;
    return false;
}

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('ecosystem_token')?.value;
    const { pathname } = req.nextUrl;
    const ip = (req as any).ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';

    // Apply Rate Limiting on Auth Endpoints
    if (pathname.startsWith('/api/auth/')) {
        if (isRateLimited(ip)) {
            return NextResponse.json({ error: 'Rate limit exceeded. Too many requests.' }, { status: 429 });
        }
    }

    // Define public paths that don't need authentication
    const publicPaths = ['/auth/login', '/auth/register', '/api/auth/login', '/api/auth/register', '/api/auth/2fa/setup', '/api/auth/2fa/verify', '/api/auth/reset-password', '/', '/pricing', '/trust-center'];
    const isPublicPath = publicPaths.includes(pathname);

    // Allow static assets, next internals, and public paths
    if (
        pathname.includes('._next') ||
        pathname.includes('/public/') ||
        pathname.startsWith('/_next') ||
        pathname.match(/\.(.*)$/) ||
        isPublicPath
    ) {
        return NextResponse.next();
    }

    // No token? Redirect to login.
    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized middleware barrier' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/auth/register', req.url));
    }

    try {
        // Verify JWT at the Edge
        const { payload } = await jwtVerify(token, secretKey);
        const userRole = payload.role as string;

        // RBAC: Role-Based Access Control
        if (pathname.startsWith('/investor') && userRole !== 'INVESTOR') {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        if (pathname.startsWith('/advisor') && userRole !== 'ADVISOR') {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        if (pathname.startsWith('/trainee') && userRole !== 'TRAINEE') {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }

        return NextResponse.next();

    } catch (error) {
        console.error('Middleware Token Error:', error);
        // Invalid token or expired
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });
        }
        const response = NextResponse.redirect(new URL('/auth/register', req.url));
        response.cookies.delete('ecosystem_token');
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
