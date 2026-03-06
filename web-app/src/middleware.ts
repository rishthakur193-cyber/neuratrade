import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ---------------------------------------------------------------------------
// In-memory rate limiter (Edge-compatible, per-instance)
// Resets on cold start — intentional for Edge Runtime constraints
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1_000; // 1 minute
const MAX_AUTH_REQUESTS = 5;             // per IP per window

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);
    if (!record || now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return false;
    }
    if (record.count >= MAX_AUTH_REQUESTS) return true;
    record.count++;
    return false;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── 1. HEALTH BYPASS ────────────────────────────────────────────────────
    // Must be the absolute first gate. No env reads, no JWT, no DB.
    // Cloud Run uptime checks, load balancers, and monitoring always pass.
    if (pathname.startsWith('/api/health')) {
        return NextResponse.next();
    }

    // ── 2. PUBLIC ROUTES (no token required) ────────────────────────────────
    const publicApiPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/2fa/setup',
        '/api/auth/2fa/verify',
        '/api/auth/reset-password',
    ];

    // Decision Intelligence is a public demo — no login required
    // Leaderboard is public read-only
    // Verified performance leaderboard and per-advisor profiles are public
    // Market Intelligence Engine is fully public
    // Trust Recovery Engine is fully public
    // Ecosystem Growth Engine is fully public
    // Broker Integration Layer is fully public
    if (
        pathname.startsWith('/api/decision-intelligence/') ||
        pathname.startsWith('/api/advisor/verified-performance') ||
        pathname.startsWith('/api/market-intelligence/') ||
        pathname.startsWith('/api/recovery/') ||
        pathname.startsWith('/api/ecosystem/') ||
        pathname.startsWith('/api/broker-integration/') ||
        pathname === '/api/advisor/leaderboard'
    ) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/auth/')) {
        const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Too many requests.' },
                { status: 429 }
            );
        }
        if (publicApiPaths.includes(pathname)) {
            return NextResponse.next();
        }
    }


    // ── 3. PROTECTED API ROUTES — JWT verification ──────────────────────────
    // Read secret inside function — never throw at module level.
    // A missing secret returns 500, not a crash that blocks all routes.
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        return NextResponse.json(
            { error: 'Server misconfiguration: auth secret not configured.' },
            { status: 500 }
        );
    }

    // Accept token from httpOnly cookie OR Authorization: Bearer header
    const cookieToken = req.cookies.get('ecosystem_token')?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    const token = cookieToken || bearerToken;

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized middleware barrier' },
            { status: 401 }
        );
    }

    try {
        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, secretKey);
        const userRole = payload.role as string;

        // ── RBAC ─────────────────────────────────────────────────────────────
        if (pathname.startsWith('/api/admin') && userRole !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Allow investors to access advisor discovery/list/performance
        const publicAdvisorApiSubpaths = [
            '/api/advisor/list',
            '/api/advisor/discovery',
            '/api/advisor/verified-performance'
        ];

        const isPublicAdvisorApi = publicAdvisorApiSubpaths.some(p => pathname.startsWith(p));

        if (pathname.startsWith('/api/advisor') && userRole !== 'ADVISOR' && !isPublicAdvisorApi) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.next();

    } catch {
        return NextResponse.json(
            { error: 'Token expired or invalid' },
            { status: 401 }
        );
    }
}

// ---------------------------------------------------------------------------
// Matcher — API routes only. Static assets / pages never touch middleware.
// ---------------------------------------------------------------------------
export const config = {
    matcher: ['/api/:path*'],
};
