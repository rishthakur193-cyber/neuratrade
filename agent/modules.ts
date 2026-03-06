/**
 * NeuraTrade / Ecosystem of Smart Investing
 * ── Module Registry ──
 *
 * Every module in the system is declared here with:
 *   - status       : current build state
 *   - purpose      : why it exists
 *   - howItWorks   : plain-language description
 *   - dependents   : which modules rely on this one
 *   - apis         : external APIs / data sources used
 */

export type ModuleStatus = 'COMPLETE' | 'IN_PROGRESS' | 'REMAINING' | 'STUB';

export interface Module {
    id: string;
    name: string;
    layer: 'BACKEND' | 'FRONTEND' | 'SHARED';
    status: ModuleStatus;
    purpose: string;
    howItWorks: string;
    dependents: string[];   // ids of modules that depend on this
    apis: string[];
    filePaths: string[];
}

export const MODULES: Module[] = [
    // ─────────────────────────────────────────────────────────
    // BACKEND
    // ─────────────────────────────────────────────────────────
    {
        id: 'backend-server',
        name: 'Backend API Server',
        layer: 'BACKEND',
        status: 'COMPLETE',
        purpose:
            'Central HTTP server and entry point for all backend requests. Handles security, routing, and graceful shutdown.',
        howItWorks:
            'An Express.js server hardened with Helmet security headers, CORS lockdown, a global rate limiter, and Morgan request logging. It registers all API routes, starts the WebSocket server, and manages graceful shutdown on SIGTERM/SIGINT for zero-downtime Cloud Run deployments.',
        dependents: ['auth-routes', 'websocket-server', 'db-routes'],
        apis: ['Google Cloud Run (hosting)', 'Prisma ORM'],
        filePaths: ['server/src/index.ts'],
    },
    {
        id: 'auth-routes',
        name: 'Auth Routes',
        layer: 'BACKEND',
        status: 'COMPLETE',
        purpose:
            'Exposes /api/auth/* REST endpoints for registration, login, 2FA, and profile retrieval.',
        howItWorks:
            'Express router wired to AuthService. Each route validates the request body before delegating to the service layer. Auth-specific rate limiting is applied at the router level to prevent brute force.',
        dependents: ['backend-server'],
        apis: [],
        filePaths: ['server/src/routes/authRoutes.ts'],
    },
    {
        id: 'db-routes',
        name: 'DB Health Routes',
        layer: 'BACKEND',
        status: 'COMPLETE',
        purpose:
            'Provides /db-check, /health and /ready probe endpoints for Cloud Run liveness and readiness checks.',
        howItWorks:
            'Issues a lightweight SELECT 1 query via Prisma. Responds 200 when the DB is up, 503 when not, giving Cloud Run the signal to route or hold traffic.',
        dependents: ['backend-server'],
        apis: ['PostgreSQL via Prisma'],
        filePaths: ['server/src/routes/dbRoutes.ts'],
    },
    {
        id: 'websocket-server',
        name: 'WebSocket Server',
        layer: 'BACKEND',
        status: 'COMPLETE',
        purpose:
            'Streams real-time market data events (LTP, trade confirmations) to connected frontend clients.',
        howItWorks:
            'Attached to the same http.Server instance as Express. Broadcasts JSON frames containing market tick data. Clients subscribe by connecting to the ws:// endpoint; the server fans out data from the SmartAPI WebSocket feed.',
        dependents: ['backend-server', 'smartapi-broker'],
        apis: ['Angel One SmartAPI WebSocket — wss://smartapisocket.angelone.in/v2'],
        filePaths: ['server/src/websocket.ts'],
    },
    {
        id: 'rate-limiter',
        name: 'Rate Limiter Middleware',
        layer: 'BACKEND',
        status: 'COMPLETE',
        purpose:
            'Protects all endpoints from abuse by capping request rates per IP address.',
        howItWorks:
            'Two tiers: a global limiter (100 req/15min) applied to every route, and a stricter auth limiter (20 req/15min) applied only to /api/auth/* paths. Implemented with express-rate-limit, Cloud Run proxy-aware via trust proxy.',
        dependents: ['backend-server'],
        apis: [],
        filePaths: ['server/src/middleware/rateLimiter.ts'],
    },
    {
        id: 'error-handler',
        name: 'Error Handler Middleware',
        layer: 'BACKEND',
        status: 'COMPLETE',
        purpose:
            'Catches all unhandled errors and returns consistent JSON error responses. Prevents stack traces leaking to clients in production.',
        howItWorks:
            'Express error-handling middleware (4-argument signature). Logs the error with Pino, strips sensitive details in production mode, and sends a standardised { status, code, message } payload.',
        dependents: ['backend-server'],
        apis: [],
        filePaths: ['server/src/middleware/errorHandler.ts'],
    },
    {
        id: 'logger',
        name: 'Server Logger',
        layer: 'BACKEND',
        status: 'COMPLETE',
        purpose:
            'Structured, production-grade logging for every backend event.',
        howItWorks:
            'Pino logger configured to emit JSON logs (easily ingested by Google Cloud Logging). Morgan is piped through Pino so HTTP request logs are structured too.',
        dependents: ['backend-server', 'error-handler'],
        apis: ['Google Cloud Logging (via stdout)'],
        filePaths: ['server/src/middleware/logger.ts'],
    },

    // ─────────────────────────────────────────────────────────
    // FRONTEND SERVICES
    // ─────────────────────────────────────────────────────────
    {
        id: 'auth-service',
        name: 'Auth Service',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Manages all user identity operations: registration, login, 2FA setup/verify, KYC updates, token verification.',
        howItWorks:
            'Pure TypeScript class (server-side, Next.js API routes). Hashes passwords with bcrypt, issues signed JWTs (24h expiry), implements TOTP 2FA via OTPAuth, and dispatches transactional emails via EmailService. Every sensitive action writes an audit log.',
        dependents: ['auth-api-routes', 'investor-dashboard', 'advisor-dashboard'],
        apis: ['Google Gemini (indirect)', 'SendGrid / Email'],
        filePaths: ['web-app/src/services/auth.service.ts'],
    },
    {
        id: 'portfolio-service',
        name: 'Portfolio Service',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Manages investor portfolios: fetching overviews, executing real trades via broker, and logging mock trades for testing.',
        howItWorks:
            'Queries SQLite (dev) or PostgreSQL (prod) via initDb(). On trade execution it calls SmartApiService with exponential backoff retry, updates local holdings & transaction history atomically, and writes an audit trail. Has a staging safety guard preventing real order execution unless ENABLE_REAL_TRADING=true.',
        dependents: ['investor-dashboard', 'ai-risk-engine'],
        apis: ['Angel One SmartAPI — Order Placement'],
        filePaths: ['web-app/src/services/portfolio.service.ts'],
    },
    {
        id: 'ai-risk-engine',
        name: 'AI Risk Engine',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Provides AI-generated portfolio risk analysis, individual asset analysis, and meeting summaries via Google Gemini.',
        howItWorks:
            'Calls Gemini 1.5 Flash with structured prompts and low temperature for reliable JSON responses. If the API key is missing or unavailable it falls back to deterministic mock data, ensuring the dashboard always has data to display. Implements the "8 Pillars of Analysis" framework for asset verdicts.',
        dependents: ['investor-dashboard', 'advisor-dashboard'],
        apis: ['Google Gemini 1.5 Flash (generativelanguage.googleapis.com)'],
        filePaths: ['web-app/src/services/ai.service.ts'],
    },
    {
        id: 'smartapi-broker',
        name: 'SmartAPI Broker Integration',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Connects to Angel One SmartAPI for MPIN login, real-time LTP quotes, and order placement.',
        howItWorks:
            'REST calls to apiconnect.angelbroking.com. Authenticated with MPIN/TOTP for session tokens (JWT + feed token for WebSocket). LTP fetch uses the market quote endpoint in LTP mode. Order placement is guarded by the ENABLE_REAL_TRADING env flag. WebSocket auth helper returns the endpoint for the client to connect to.',
        dependents: ['portfolio-service', 'websocket-server'],
        apis: ['Angel One SmartAPI REST (apiconnect.angelbroking.com)'],
        filePaths: ['web-app/src/services/smartapi.service.ts'],
    },
    {
        id: 'matching-engine',
        name: 'Fiduciary Matching Engine',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Recommends SEBI-verified advisors to investors using a scored matching algorithm.',
        howItWorks:
            'Queries the database for verified advisors, ranks them by rating and alpha generated, then applies a scoring algorithm (tier weight + performance weight) capped at 99%. Returns a sorted list with a human-readable match reasoning string.',
        dependents: ['investor-dashboard', 'matching-api'],
        apis: ['Internal DB (AdvisorProfile table)'],
        filePaths: ['web-app/src/services/matching.service.ts'],
    },
    {
        id: 'analytics-service',
        name: 'Analytics Service',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Aggregates platform-wide metrics for the admin dashboard (total AUM, user counts, advisor performance).',
        howItWorks:
            'SQL aggregation queries over Portfolio, User, and AdvisorProfile tables. Returns consolidated analytics snapshots.',
        dependents: ['admin-dashboard'],
        apis: ['Internal DB'],
        filePaths: ['web-app/src/services/analytics.service.ts'],
    },
    {
        id: 'communication-service',
        name: 'Communication Service',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Handles in-platform messaging between investors and advisors, including scheduling and notifications.',
        howItWorks:
            'Creates Message records in the DB, sends real-time notifications, and supports scheduled meeting setup for advisor–investor sessions.',
        dependents: ['advisor-dashboard', 'investor-dashboard'],
        apis: ['Internal DB'],
        filePaths: ['web-app/src/services/communication.service.ts'],
    },
    {
        id: 'training-service',
        name: 'Training Service',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Powers the 90-Day Advisor Certification Journey — tracks trainee module completions and assessments.',
        howItWorks:
            'Records course progress in the TrainingProgress table. Returns module completion percentages and milestone statuses for the trainee dashboard.',
        dependents: ['training-dashboard'],
        apis: ['Internal DB'],
        filePaths: ['web-app/src/services/training.service.ts'],
    },
    {
        id: 'audit-service',
        name: 'Audit Service',
        layer: 'SHARED',
        status: 'COMPLETE',
        purpose:
            'Writes immutable audit trail entries for every security-sensitive event in the system.',
        howItWorks:
            'Inserts into the AuditLog table with userId, action name, JSON metadata, IP address, and user agent. Called by AuthService on login/2FA/KYC and by PortfolioService on every trade. Never throws — failures are silently logged to prevent audit issues from blocking core flows.',
        dependents: ['auth-service', 'portfolio-service', 'admin-dashboard'],
        apis: ['Internal DB'],
        filePaths: ['web-app/src/services/audit.service.ts'],
    },
    {
        id: 'email-service',
        name: 'Email Service',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Sends transactional emails: welcome, security alerts, password resets.',
        howItWorks:
            'Wraps SendGrid API (or a sandbox mailer in staging). Templates are defined inline. All sends are fire-and-forget (async) so they never block user-facing requests.',
        dependents: ['auth-service'],
        apis: ['SendGrid API (sandbox in staging)'],
        filePaths: ['web-app/src/services/email.service.ts'],
    },
    {
        id: 'payment-service',
        name: 'Payment Service',
        layer: 'FRONTEND',
        status: 'STUB',
        purpose:
            'Will handle subscription payments from investors and revenue distribution to advisors.',
        howItWorks:
            'Currently a stub. Planned integration with Razorpay for INR payment processing. Will create Payment records, validate webhook signatures, and trigger subscription activation.',
        dependents: ['investor-dashboard', 'advisor-dashboard'],
        apis: ['Razorpay (planned)'],
        filePaths: ['web-app/src/services/payment.service.ts'],
    },

    // ─────────────────────────────────────────────────────────
    // FRONTEND PAGES / UI
    // ─────────────────────────────────────────────────────────
    {
        id: 'landing-page',
        name: 'Landing Page',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'First impression for visitors. Showcases platform capabilities, KPI stats, fraud radar demo, and CTAs.',
        howItWorks:
            'Next.js App Router page with Framer Motion animations, glassmorphism GlassCard components, and responsive layout. Leads users to /auth/register or /auth/login.',
        dependents: [],
        apis: [],
        filePaths: ['web-app/src/app/page.tsx'],
    },
    {
        id: 'auth-pages',
        name: 'Auth Pages (Login / Register)',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose: 'Lets users create accounts and log in with optional 2FA.',
        howItWorks:
            'Server-side form handling calling /api/auth/register and /api/auth/login. Detects 2FA requirement and shows TOTP input. On success stores the JWT in a secure httpOnly cookie and redirects to the role-appropriate dashboard.',
        dependents: ['auth-service'],
        apis: ['/api/auth/*'],
        filePaths: ['web-app/src/app/auth/'],
    },
    {
        id: 'investor-dashboard',
        name: 'Investor Dashboard',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Central control panel for investors: portfolio overview, AI insights, holdings, advisor matches.',
        howItWorks:
            'Fetches data from /api/portfolio, /api/ai, and /api/matching. Renders real-time LTP via WebSocket connection. Charts built with Recharts. Premium glassmorphism styling.',
        dependents: ['portfolio-service', 'ai-risk-engine', 'matching-engine'],
        apis: ['/api/portfolio', '/api/ai', '/api/matching', 'WebSocket'],
        filePaths: ['web-app/src/app/investor/'],
    },
    {
        id: 'advisor-dashboard',
        name: 'Advisor Dashboard',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Workspace for SEBI advisors: client management, meeting summaries, AI draft reports, performance tracking.',
        howItWorks:
            'Pulls data from /api/advisor, /api/ai (meeting summary), and /api/communication. AI-generated meeting summaries can be triggered inline.',
        dependents: ['auth-service', 'ai-risk-engine', 'communication-service'],
        apis: ['/api/advisor', '/api/ai', '/api/communication'],
        filePaths: ['web-app/src/app/advisor/'],
    },
    {
        id: 'training-dashboard',
        name: 'Training / 90-Day Journey',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Guides aspiring advisors through a structured 90-day certification curriculum.',
        howItWorks:
            'Renders course modules as an interactive progress UI. TrainingService tracks completion percentages per module. Unlocks the next module upon assessment pass.',
        dependents: ['training-service'],
        apis: ['/api/training'],
        filePaths: ['web-app/src/app/training/'],
    },
    {
        id: 'kyc-module',
        name: 'KYC Module',
        layer: 'FRONTEND',
        status: 'STUB',
        purpose:
            'Allows users to upload identity documents for KYC verification as required by SEBI regulations.',
        howItWorks:
            'Currently a stub page. Planned: file upload to Google Cloud Storage, document status tracking, and admin review workflow. AuthService already has updateKyc() backend support.',
        dependents: ['auth-service', 'admin-dashboard'],
        apis: ['Google Cloud Storage (planned)', '/api/kyc'],
        filePaths: ['web-app/src/app/kyc/'],
    },
    {
        id: 'admin-dashboard',
        name: 'Admin Dashboard',
        layer: 'FRONTEND',
        status: 'STUB',
        purpose:
            'Platform operations view for administrators: user management, KYC review, analytics, and fraud flags.',
        howItWorks:
            'Currently a stub. Planned: analytics widgets (AnalyticsService), KYC review queue, advisor verification controls, and audit log viewer.',
        dependents: ['analytics-service', 'audit-service'],
        apis: ['/api/admin', '/api/analytics'],
        filePaths: ['web-app/src/app/admin/'],
    },
    {
        id: 'leaderboard',
        name: 'Advisor Leaderboard',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Public ranking of verified advisors by performance, alpha generation, and investor ratings.',
        howItWorks:
            'Reads from AdvisorProfile ordered by rating and alpha. Publicly accessible without login, encouraging trust and advisor accountability.',
        dependents: [],
        apis: ['/api/advisor'],
        filePaths: ['web-app/src/app/leaderboard/'],
    },
    {
        id: 'trust-center',
        name: 'Trust Center',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Transparency page showing SEBI compliance details, security certifications, and fraud prevention system.',
        howItWorks:
            'Static content page with links to SEBI verification, SOC-2 certification, and the AI Fraud Radar overview.',
        dependents: [],
        apis: [],
        filePaths: ['web-app/src/app/trust-center/'],
    },
    {
        id: 'premium-ui',
        name: 'Premium UI Design System',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Shared component library: GlassCard, PremiumButton, NeonBadge, SectionHighlight — the visual backbone of the platform.',
        howItWorks:
            'React components with CVA variants, Framer Motion animations, Tailwind utility classes, and CSS custom properties for consistent theming across all pages.',
        dependents: ['landing-page', 'investor-dashboard', 'advisor-dashboard', 'auth-pages'],
        apis: [],
        filePaths: ['web-app/src/components/ui/PremiumUI.tsx'],
    },
    {
        id: 'middleware-auth',
        name: 'Auth Middleware (Next.js)',
        layer: 'FRONTEND',
        status: 'COMPLETE',
        purpose:
            'Protects all dashboard routes — redirects unauthenticated users to /auth/login.',
        howItWorks:
            'Next.js middleware that reads the JWT cookie, verifies the signature, and uses role-based routing to gate /investor, /advisor, /admin, /training pages.',
        dependents: ['investor-dashboard', 'advisor-dashboard', 'admin-dashboard'],
        apis: [],
        filePaths: ['web-app/src/middleware.ts'],
    },

    // ─────────────────────────────────────────────────────────
    // AGENT (NEW — being built now)
    // ─────────────────────────────────────────────────────────
    {
        id: 'agent-core',
        name: 'Self-Reporting Development Agent',
        layer: 'SHARED',
        status: 'IN_PROGRESS',
        purpose:
            'Autonomous agent that continuously tracks, explains, and reports its own development process. Generates the PROJECT BUILD STATUS, architecture map, dev log, and non-developer summaries.',
        howItWorks:
            'TypeScript CLI (agent/run.ts) that iterates over the module registry, explains each module, logs every step to dev-log.json, prints a live progress bar, and serves a JSON status API consumed by the Next.js /agent dashboard page.',
        dependents: ['agent-dashboard'],
        apis: ['fs (local disk for dev-log.json)', 'Next.js API route'],
        filePaths: ['agent/'],
    },
    {
        id: 'agent-dashboard',
        name: 'Agent Dashboard Page',
        layer: 'FRONTEND',
        status: 'IN_PROGRESS',
        purpose:
            'Visual browser UI showing the agent\'s live build status, architecture map, dev log, and completion ring.',
        howItWorks:
            'Next.js page at /agent. Auto-polls /api/agent/status every 5s. Renders glassmorphism cards for each module group, a Mermaid-style architecture diagram, and a scrolling dev log feed.',
        dependents: ['agent-core'],
        apis: ['/api/agent/status'],
        filePaths: ['web-app/src/app/agent/'],
    },
];

/** Helper: get a module by id */
export function getModule(id: string): Module | undefined {
    return MODULES.find(m => m.id === id);
}

/** Helper: get modules by status */
export function getModulesByStatus(status: ModuleStatus): Module[] {
    return MODULES.filter(m => m.status === status);
}

/** Compute overall completion percentage */
export function getCompletionPercent(): number {
    const total = MODULES.length;
    const done = MODULES.filter(m => m.status === 'COMPLETE').length;
    return Math.round((done / total) * 100);
}
