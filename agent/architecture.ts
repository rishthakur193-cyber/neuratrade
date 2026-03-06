/**
 * NeuraTrade — System Architecture Map
 *
 * Describes how every component in the system connects,
 * how data flows, and which responsibilities belong to
 * frontend vs backend layers.
 */

export interface ComponentNode {
    id: string;
    label: string;
    layer: 'BACKEND' | 'FRONTEND' | 'EXTERNAL' | 'DATABASE' | 'AGENT';
    description: string;
}

export interface DataFlow {
    from: string;
    to: string;
    label: string;
    protocol: 'HTTP/REST' | 'WebSocket' | 'SQL' | 'gRPC' | 'Event' | 'Internal';
}

export const ARCHITECTURE_NODES: ComponentNode[] = [
    // External
    { id: 'user-browser', label: 'User Browser', layer: 'EXTERNAL', description: 'Investor, Advisor, or Admin using the platform' },
    { id: 'angel-one', label: 'Angel One SmartAPI', layer: 'EXTERNAL', description: 'Broker REST + WebSocket for real-time market data and order placement' },
    { id: 'gemini-api', label: 'Google Gemini 1.5 Flash', layer: 'EXTERNAL', description: 'LLM providing AI risk analysis, asset verdicts, and meeting summaries' },
    { id: 'sendgrid', label: 'SendGrid Email', layer: 'EXTERNAL', description: 'Transactional emails: welcome, security alerts, password resets' },
    { id: 'cloud-run', label: 'Google Cloud Run', layer: 'EXTERNAL', description: 'Container hosting for the backend API (asia-south1 region)' },
    { id: 'cloud-storage', label: 'Google Cloud Storage', layer: 'EXTERNAL', description: 'KYC document storage (planned)' },

    // Database
    { id: 'postgres', label: 'PostgreSQL (Prisma)', layer: 'DATABASE', description: 'Primary relational database: Users, Portfolios, Holdings, Advisors, Audit Logs' },

    // Backend
    { id: 'express-server', label: 'Express API Server', layer: 'BACKEND', description: 'Entry point — security, routing, CORS, rate limiting, graceful shutdown' },
    { id: 'ws-server', label: 'WebSocket Server', layer: 'BACKEND', description: 'Real-time LTP streaming to connected frontend clients' },
    { id: 'auth-middleware', label: 'Rate Limiter + Helm', layer: 'BACKEND', description: 'Global + per-route rate limiting and security headers' },

    // Frontend (Next.js)
    { id: 'nextjs', label: 'Next.js App Router', layer: 'FRONTEND', description: 'Full-stack React framework hosting all pages and API routes' },
    { id: 'auth-svc', label: 'Auth Service', layer: 'FRONTEND', description: 'JWT + bcrypt + TOTP 2FA — handles all identity operations' },
    { id: 'portfolio-svc', label: 'Portfolio Service', layer: 'FRONTEND', description: 'Trade execution with broker retry logic, holdings management' },
    { id: 'ai-svc', label: 'AI Risk Engine', layer: 'FRONTEND', description: '8-Pillar asset analysis, VaR, portfolio risk via Gemini' },
    { id: 'matching-svc', label: 'Matching Engine', layer: 'FRONTEND', description: 'Scores and ranks advisors for investor compatibility' },
    { id: 'audit-svc', label: 'Audit Service', layer: 'FRONTEND', description: 'Immutable event log for all security-sensitive actions' },
    { id: 'email-svc', label: 'Email Service', layer: 'FRONTEND', description: 'Fire-and-forget transactional email dispatch' },

    // UI Pages
    { id: 'landing', label: 'Landing Page', layer: 'FRONTEND', description: 'Marketing homepage — Framer Motion, GlassCards, KPI ribbon' },
    { id: 'auth-ui', label: 'Auth Pages', layer: 'FRONTEND', description: 'Login / Register with 2FA TOTP flow' },
    { id: 'investor-ui', label: 'Investor Dashboard', layer: 'FRONTEND', description: 'Portfolio, AI insights, holdings, advisor matches — real-time WebSocket' },
    { id: 'advisor-ui', label: 'Advisor Dashboard', layer: 'FRONTEND', description: 'Client management, AI meeting summaries, performance tracking' },
    { id: 'training-ui', label: '90-Day Training', layer: 'FRONTEND', description: 'Advisor certification curriculum with progress tracking' },
    { id: 'admin-ui', label: 'Admin Dashboard', layer: 'FRONTEND', description: 'Platform analytics, KYC review, fraud flags (stub)' },
    { id: 'leaderboard-ui', label: 'Leaderboard', layer: 'FRONTEND', description: 'Public advisor ranking by alpha and ratings' },
    { id: 'trust-ui', label: 'Trust Center', layer: 'FRONTEND', description: 'SEBI compliance, SOC-2 certs, fraud prevention info' },

    // Agent
    { id: 'agent-cli', label: 'Dev Agent CLI', layer: 'AGENT', description: 'TypeScript CLI that orchestrates, explains, and logs the build process' },
    { id: 'agent-dashboard', label: 'Agent Dashboard /agent', layer: 'AGENT', description: 'Next.js page showing live build status, architecture, dev log' },
];

export const DATA_FLOWS: DataFlow[] = [
    // Browser → Next.js
    { from: 'user-browser', to: 'nextjs', label: 'HTTPS page requests', protocol: 'HTTP/REST' },
    { from: 'user-browser', to: 'ws-server', label: 'WebSocket LTP stream', protocol: 'WebSocket' },

    // Next.js API routes → Services
    { from: 'nextjs', to: 'auth-svc', label: '/api/auth/*', protocol: 'Internal' },
    { from: 'nextjs', to: 'portfolio-svc', label: '/api/portfolio/*', protocol: 'Internal' },
    { from: 'nextjs', to: 'ai-svc', label: '/api/ai/*', protocol: 'Internal' },
    { from: 'nextjs', to: 'matching-svc', label: '/api/matching', protocol: 'Internal' },

    // Services → DB
    { from: 'auth-svc', to: 'postgres', label: 'User CRUD, 2FA secrets', protocol: 'SQL' },
    { from: 'portfolio-svc', to: 'postgres', label: 'Portfolio, Holdings, Transactions', protocol: 'SQL' },
    { from: 'matching-svc', to: 'postgres', label: 'AdvisorProfile queries', protocol: 'SQL' },
    { from: 'audit-svc', to: 'postgres', label: 'AuditLog inserts', protocol: 'SQL' },

    // Services → External
    { from: 'ai-svc', to: 'gemini-api', label: 'Portfolio risk & asset analysis prompts', protocol: 'HTTP/REST' },
    { from: 'portfolio-svc', to: 'angel-one', label: 'Order placement (guarded)', protocol: 'HTTP/REST' },
    { from: 'email-svc', to: 'sendgrid', label: 'Transactional emails', protocol: 'HTTP/REST' },

    // Backend ↔ External
    { from: 'express-server', to: 'angel-one', label: 'Broker auth (MPIN/TOTP)', protocol: 'HTTP/REST' },
    { from: 'ws-server', to: 'angel-one', label: 'Market data WebSocket feed', protocol: 'WebSocket' },
    { from: 'express-server', to: 'postgres', label: 'Readiness probe SELECT 1', protocol: 'SQL' },
    { from: 'cloud-run', to: 'express-server', label: 'Container host', protocol: 'HTTP/REST' },

    // Agent
    { from: 'agent-cli', to: 'agent-dashboard', label: 'dev-log.json on disk', protocol: 'Internal' },
    { from: 'agent-dashboard', to: 'nextjs', label: '/api/agent/status', protocol: 'HTTP/REST' },
];

/** Generates an ASCII architecture diagram for terminal display */
export function renderAsciiMap(): string {
    return `
╔══════════════════════════════════════════════════════════════════════════╗
║             NEURATRADE — SYSTEM ARCHITECTURE MAP                        ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  👤 USER BROWSER                                                         ║
║      │ HTTPS              │ WebSocket (LTP)                              ║
║      ▼                    ▼                                              ║
║  ┌─────────────────┐  ┌──────────────────┐                              ║
║  │ Next.js App     │  │ Express + WS     │ ←── Google Cloud Run         ║
║  │ (Frontend)      │  │ Server (Backend) │                              ║
║  └────────┬────────┘  └──────┬───────────┘                              ║
║           │                  │                                           ║
║  ┌────────▼────────────────────────────────────────────────┐            ║
║  │  NEXT.JS API ROUTES (/api/*)                            │            ║
║  │  auth • portfolio • ai • matching • communication       │            ║
║  │  training • analytics • admin • kyc • payments(stub)   │            ║
║  └────────────────────────────┬────────────────────────────┘            ║
║                               │                                          ║
║  ┌────────────────────────────▼─────────────────────────────┐           ║
║  │  SERVICES LAYER                                          │           ║
║  │  AuthService  PortfolioService  AIService  EmailService  │           ║
║  │  MatchingEngine  SmartApiService  AuditService  Analytics │           ║
║  └────┬───────────────┬──────────────┬────────────────┬─────┘           ║
║       │               │              │                │                  ║
║       ▼               ▼              ▼                ▼                 ║
║  ┌─────────┐  ┌───────────────┐  ┌────────┐  ┌──────────────┐          ║
║  │PostgreSQL│  │Angel One      │  │Gemini  │  │SendGrid Email│          ║
║  │(Prisma) │  │SmartAPI       │  │AI API  │  │(Transactional│          ║
║  └─────────┘  │REST + WS      │  └────────┘  └──────────────┘          ║
║               └───────────────┘                                          ║
║                                                                          ║
║  🤖 AGENT LAYER                                                          ║
║  agent/run.ts → writes dev-log.json                                      ║
║  /agent page  → reads /api/agent/status → live dashboard                 ║
╚══════════════════════════════════════════════════════════════════════════╝

  FRONTEND RESPONSIBILITIES          BACKEND RESPONSIBILITIES
  ─────────────────────────          ────────────────────────
  • UI rendering (Next.js/React)     • REST API endpoints (Express)
  • Route protection (middleware)    • WebSocket LTP fan-out
  • Service calls to APIs            • Rate limiting + security headers
  • Real-time WS consumption         • Graceful shutdown (Cloud Run)
  • AI, Auth, Portfolio services     • DB readiness probes (Prisma)
  • In-platform messaging            • Production logging (Pino)
  • Training module tracking         • Auth route hardening
`;
}

/** Returns architecture as JSON for the API route */
export function getArchitectureJson() {
    return {
        nodes: ARCHITECTURE_NODES,
        flows: DATA_FLOWS,
        legend: {
            BACKEND: 'Node.js / Express layer',
            FRONTEND: 'Next.js App Router layer',
            EXTERNAL: 'Third-party APIs & cloud services',
            DATABASE: 'Data persistence layer',
            AGENT: 'Self-reporting development agent',
        },
    };
}
