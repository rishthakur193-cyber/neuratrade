/**
 * GET /api/agent/status
 *
 * Returns the current state of the development agent:
 * - All modules with statuses
 * - Recent dev log entries
 * - System architecture map
 * - Completion percentage
 * - Plain-language summary data
 * - Improvement suggestions
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// We inline the data here rather than importing from the agent/ directory
// to avoid cross-package import issues in the Next.js runtime.

type ModuleStatus = 'COMPLETE' | 'IN_PROGRESS' | 'REMAINING' | 'STUB';

interface ModuleSummary {
    id: string;
    name: string;
    layer: string;
    status: ModuleStatus;
    purpose: string;
    howItWorks: string;
    dependents: string[];
    apis: string[];
}

// Read dev-log.json if it exists
function readDevLog(): any[] {
    try {
        const logPath = path.resolve(process.cwd(), '../agent/dev-log.json');
        if (fs.existsSync(logPath)) {
            const raw = fs.readFileSync(logPath, 'utf8');
            const all = JSON.parse(raw) as any[];
            return all.slice(-30); // Last 30 entries
        }
    } catch {
        // Silently return empty if file not found
    }
    return [];
}

// Inline module data (mirrors agent/modules.ts — the source of truth)
const MODULE_SUMMARIES: ModuleSummary[] = [
    { id: 'backend-server', name: 'Backend API Server', layer: 'BACKEND', status: 'COMPLETE', purpose: 'Central HTTP server and entry point for all backend requests.', howItWorks: 'Express.js hardened with Helmet, CORS, rate limiting, and graceful Cloud Run shutdown.', dependents: ['auth-routes', 'websocket-server'], apis: ['Google Cloud Run', 'Prisma ORM'] },
    { id: 'auth-routes', name: 'Auth Routes', layer: 'BACKEND', status: 'COMPLETE', purpose: 'Exposes /api/auth/* REST endpoints for registration, login, 2FA.', howItWorks: 'Express router wired to AuthService with per-route rate limiting.', dependents: ['backend-server'], apis: [] },
    { id: 'db-routes', name: 'DB Health Routes', layer: 'BACKEND', status: 'COMPLETE', purpose: 'Cloud Run liveness and readiness probes.', howItWorks: 'SELECT 1 probe via Prisma — 200 when DB up, 503 when not.', dependents: ['backend-server'], apis: ['PostgreSQL via Prisma'] },
    { id: 'websocket-server', name: 'WebSocket Server', layer: 'BACKEND', status: 'COMPLETE', purpose: 'Real-time market data streaming to connected frontend clients.', howItWorks: 'Attached to the same http.Server as Express. Broadcasts LTP JSON frames.', dependents: ['backend-server', 'smartapi-broker'], apis: ['Angel One SmartAPI WebSocket'] },
    { id: 'rate-limiter', name: 'Rate Limiter', layer: 'BACKEND', status: 'COMPLETE', purpose: 'Protects all endpoints from abuse.', howItWorks: 'Global (100 req/15min) + stricter auth-route limiter (20 req/15min).', dependents: ['backend-server'], apis: [] },
    { id: 'error-handler', name: 'Error Handler', layer: 'BACKEND', status: 'COMPLETE', purpose: 'Catches all unhandled errors, returns consistent JSON.', howItWorks: 'Express 4-arg middleware — logs with Pino, strips stack traces in prod.', dependents: ['backend-server'], apis: [] },
    { id: 'logger', name: 'Server Logger', layer: 'BACKEND', status: 'COMPLETE', purpose: 'Structured JSON logging for Google Cloud Logging.', howItWorks: 'Pino logger with Morgan HTTP request piping.', dependents: ['backend-server', 'error-handler'], apis: ['Google Cloud Logging'] },
    { id: 'auth-service', name: 'Auth Service', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'JWT + bcrypt + TOTP 2FA — all identity operations.', howItWorks: 'Registers, logs in, manages 2FA, verifies tokens, dispatches emails.', dependents: ['auth-api-routes', 'investor-dashboard', 'advisor-dashboard'], apis: ['SendGrid'] },
    { id: 'portfolio-service', name: 'Portfolio Service', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Trade execution with broker retry, holdings management.', howItWorks: 'DB queries + SmartAPI calls with exponential backoff. Staging safety guard.', dependents: ['investor-dashboard', 'ai-risk-engine'], apis: ['Angel One SmartAPI Order Placement'] },
    { id: 'ai-risk-engine', name: 'AI Risk Engine', layer: 'FRONTEND', status: 'COMPLETE', purpose: '8-Pillar asset analysis, VaR, portfolio risk via Gemini AI.', howItWorks: 'Gemini 1.5 Flash with structured prompts. Falls back to deterministic mock.', dependents: ['investor-dashboard', 'advisor-dashboard'], apis: ['Google Gemini 1.5 Flash'] },
    { id: 'smartapi-broker', name: 'SmartAPI Broker', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Angel One integration for MPIN login, LTP, order placement.', howItWorks: 'REST calls to apiconnect.angelbroking.com. Order guarded by ENABLE_REAL_TRADING flag.', dependents: ['portfolio-service', 'websocket-server'], apis: ['Angel One SmartAPI REST'] },
    { id: 'matching-engine', name: 'Matching Engine', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Recommends SEBI advisors using a scoring algorithm.', howItWorks: 'Queries AdvisorProfile, applies tier + performance weighting capped at 99%.', dependents: ['investor-dashboard'], apis: ['Internal DB'] },
    { id: 'analytics-service', name: 'Analytics Service', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Platform-wide metrics for the admin dashboard.', howItWorks: 'SQL aggregation over Portfolio, User, and AdvisorProfile tables.', dependents: ['admin-dashboard'], apis: ['Internal DB'] },
    { id: 'communication-service', name: 'Communication Service', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'In-platform messaging between investors and advisors.', howItWorks: 'Creates Message records, sends notifications, supports meeting scheduling.', dependents: ['advisor-dashboard', 'investor-dashboard'], apis: ['Internal DB'] },
    { id: 'training-service', name: 'Training Service', layer: 'FRONTEND', status: 'COMPLETE', purpose: '90-Day Advisor Certification Journey tracking.', howItWorks: 'Records course progress per module. Returns completion %.', dependents: ['training-dashboard'], apis: ['Internal DB'] },
    { id: 'audit-service', name: 'Audit Service', layer: 'SHARED', status: 'COMPLETE', purpose: 'Immutable audit trail for every security-sensitive event.', howItWorks: 'Inserts into AuditLog with userId, action, metadata, IP. Never throws.', dependents: ['auth-service', 'portfolio-service', 'admin-dashboard'], apis: ['Internal DB'] },
    { id: 'email-service', name: 'Email Service', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Transactional emails: welcome, security alerts, resets.', howItWorks: 'SendGrid wrapping, fire-and-forget async, never blocks user requests.', dependents: ['auth-service'], apis: ['SendGrid'] },
    { id: 'payment-service', name: 'Payment Service', layer: 'FRONTEND', status: 'STUB', purpose: 'Subscription payments — investor to advisor via Razorpay.', howItWorks: 'Currently a stub. Razorpay integration planned.', dependents: ['investor-dashboard', 'advisor-dashboard'], apis: ['Razorpay (planned)'] },
    { id: 'landing-page', name: 'Landing Page', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Marketing homepage with KPI stats and CTAs.', howItWorks: 'Framer Motion + glassmorphism GlassCards. Leads to /auth/register.', dependents: [], apis: [] },
    { id: 'auth-pages', name: 'Auth Pages', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Login / Register with optional 2FA TOTP.', howItWorks: 'Server-side form handling, JWT stored in cookie, role-based redirect.', dependents: ['auth-service'], apis: ['/api/auth/*'] },
    { id: 'investor-dashboard', name: 'Investor Dashboard', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Portfolio, AI insights, holdings, advisor matches.', howItWorks: 'Fetches /api/portfolio, /api/ai, /api/matching. Real-time WS for LTP.', dependents: ['portfolio-service', 'ai-risk-engine', 'matching-engine'], apis: ['/api/portfolio', '/api/ai', 'WebSocket'] },
    { id: 'advisor-dashboard', name: 'Advisor Dashboard', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Client management, AI meeting summaries, performance tracking.', howItWorks: 'Pulls /api/advisor, /api/ai (meeting summary), /api/communication.', dependents: ['auth-service', 'ai-risk-engine', 'communication-service'], apis: ['/api/advisor', '/api/ai'] },
    { id: 'training-dashboard', name: 'Training / 90-Day Journey', layer: 'FRONTEND', status: 'COMPLETE', purpose: '90-day certification curriculum for aspiring advisors.', howItWorks: 'Progress UI unlocking modules on assessment pass.', dependents: ['training-service'], apis: ['/api/training'] },
    { id: 'kyc-module', name: 'KYC Module', layer: 'FRONTEND', status: 'STUB', purpose: 'Document upload for SEBI-required identity verification.', howItWorks: 'Stub page. Planned: GCS upload, doc status tracking, admin review.', dependents: ['auth-service', 'admin-dashboard'], apis: ['Google Cloud Storage (planned)'] },
    { id: 'admin-dashboard', name: 'Admin Dashboard', layer: 'FRONTEND', status: 'STUB', purpose: 'Platform ops: user management, KYC review, analytics, fraud flags.', howItWorks: 'Stub. Planned: AnalyticsService, KYC queue, audit log viewer.', dependents: ['analytics-service', 'audit-service'], apis: ['/api/admin'] },
    { id: 'leaderboard', name: 'Advisor Leaderboard', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Public advisor ranking by alpha and ratings.', howItWorks: 'AdvisorProfile ordered by rating and alpha. No login required.', dependents: [], apis: ['/api/advisor'] },
    { id: 'trust-center', name: 'Trust Center', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'SEBI compliance, SOC-2 certs, fraud prevention transparency.', howItWorks: 'Static content page.', dependents: [], apis: [] },
    { id: 'premium-ui', name: 'Premium UI Design System', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Shared component library: GlassCard, PremiumButton, NeonBadge.', howItWorks: 'CVA variants, Framer Motion, Tailwind utilities, CSS custom properties.', dependents: ['landing-page', 'investor-dashboard', 'advisor-dashboard'], apis: [] },
    { id: 'middleware-auth', name: 'Auth Middleware (Next.js)', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Protects route with JWT verification and role-based gating.', howItWorks: 'Next.js middleware reads JWT cookie, verifies, role-routes appropriately.', dependents: ['investor-dashboard', 'advisor-dashboard', 'admin-dashboard'], apis: [] },
    { id: 'agent-core', name: 'Dev Agent CLI', layer: 'SHARED', status: 'COMPLETE', purpose: 'Self-reporting agent that tracks and explains the build process.', howItWorks: 'TypeScript CLI iterating modules, logging to dev-log.json, ASCII architect map.', dependents: ['agent-dashboard'], apis: ['fs', 'Next.js API'] },
    { id: 'agent-dashboard', name: 'Agent Dashboard', layer: 'FRONTEND', status: 'COMPLETE', purpose: 'Visual /agent page showing live build status and dev log.', howItWorks: 'Next.js + auto-poll /api/agent/status every 5s. Glassmorphism UI.', dependents: [], apis: ['/api/agent/status'] },
];

function computeCompletion(modules: ModuleSummary[]) {
    const total = modules.length;
    const done = modules.filter(m => m.status === 'COMPLETE').length;
    return Math.round((done / total) * 100);
}

export async function GET() {
    const completionPercent = computeCompletion(MODULE_SUMMARIES);
    const byStatus = {
        COMPLETE: MODULE_SUMMARIES.filter(m => m.status === 'COMPLETE'),
        IN_PROGRESS: MODULE_SUMMARIES.filter(m => m.status === 'IN_PROGRESS'),
        STUB: MODULE_SUMMARIES.filter(m => m.status === 'STUB'),
        REMAINING: MODULE_SUMMARIES.filter(m => m.status === 'REMAINING'),
    };

    const recentLog = readDevLog();

    const suggestions = [
        { area: 'Payment Service', suggestion: 'Integrate Razorpay Subscriptions for monthly advisory fee billing.', priority: 'HIGH' },
        { area: 'KYC Module', suggestion: 'Add DigiLocker API for instant government-verified KYC — faster onboarding.', priority: 'HIGH' },
        { area: 'AI Risk Engine', suggestion: 'Add NSE/BSE announcement sentiment analysis for news-adjusted risk scores.', priority: 'MEDIUM' },
        { area: 'Admin Dashboard', suggestion: 'Automated fraud scoring pipeline cross-referencing SmartAPI P&L with advisor-reported returns.', priority: 'HIGH' },
        { area: 'WebSocket Server', suggestion: 'Redis Pub/Sub for multi-instance LTP broadcasting in production.', priority: 'MEDIUM' },
        { area: 'Auth Service', suggestion: 'Magic-link email login as a password-free alternative.', priority: 'LOW' },
    ];

    return NextResponse.json({
        generatedAt: new Date().toISOString(),
        completionPercent,
        totalModules: MODULE_SUMMARIES.length,
        modules: MODULE_SUMMARIES,
        byStatus,
        recentLog,
        suggestions,
        plainSummary: {
            built: [
                'Secure login system with two-factor authentication',
                'Real-time portfolio tracker connected to a live broker (Angel One)',
                'AI analyst scoring portfolio risk via Google Gemini AI',
                'Advisor-matching engine ranked by SEBI-verified performance',
                '90-day certification journey for aspiring advisors',
                'Fraud detection blocking unverified "investment gurus"',
                'Immutable audit trail for every security-sensitive action',
                'Production-hardened cloud backend on Google Cloud Run',
            ],
            remaining: [
                'Payment Service — Razorpay subscription integration',
                'KYC Module — document upload + admin review workflow',
                'Admin Dashboard — full analytics, KYC queue, fraud flags',
            ],
            howItWorks: 'An investor signs up → passes KYC → links broker → AI analyses portfolio → matching engine suggests advisor → advisor provides guidance → payments processed → all actions permanently audited.',
        },
    });
}
