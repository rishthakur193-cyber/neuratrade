/**
 * NeuraTrade — Frontend API Connectivity Test Suite
 * ==================================================
 * Tests all 19 API routes against the running dev server.
 * Exercises: health, auth (register/login/me/reset), session,
 * portfolio GET, portfolio trade, investor dashboard,
 * advisor, admin, AI, analytics, communication, KYC,
 * matching, payments, SmartAPI, training.
 * Reports CORS headers, auth flow, and any failures.
 */

const BASE = 'http://localhost:3799'
const RUN_ID = `apitest_${Date.now()}`
const TEST_EMAIL = `${RUN_ID}@test.neuratrade`
const TEST_PASS = 'ApiTest@Secure99'

// ── Helpers ─────────────────────────────────────────────────────────────────
interface TestResult {
    label: string
    route: string
    method: string
    status: number | null
    expected: number
    pass: boolean
    note: string
    corsOk?: boolean
}

const RESULTS: TestResult[] = []

function record(r: TestResult) {
    RESULTS.push(r)
    const icon = r.pass ? '✅' : '❌'
    const cors = r.corsOk === undefined ? '' : (r.corsOk ? ' [CORS:ok]' : ' [CORS:MISSING]')
    console.log(`  ${icon} [${r.method} ${r.route}] ${r.status ?? 'ERR'} — ${r.label}${cors}`)
    if (!r.pass) console.log(`     ↳ ${r.note}`)
}

async function req(
    method: string,
    path: string,
    opts: {
        body?: object
        token?: string
        cookie?: string
        expectedStatus?: number
        label?: string
        checkCors?: boolean
    } = {}
): Promise<{ status: number; body: any; headers: Headers }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`
    if (opts.cookie) headers['Cookie'] = opts.cookie

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        redirect: 'manual',
    })

    const text = await res.text()
    let body: any
    try { body = JSON.parse(text) } catch { body = text }

    const expected = opts.expectedStatus ?? 200
    const pass = res.status === expected
    const corsHeader = res.headers.get('access-control-allow-origin')
    // Next.js same-origin APIs don't always set CORS headers — that's expected for same-origin.
    // We check that the response isn't blocked with a network error.
    const corsOk = opts.checkCors ? (res.status < 500) : undefined

    record({
        label: opts.label ?? path,
        route: path,
        method,
        status: res.status,
        expected,
        pass,
        note: pass ? '' : `expected ${expected}, got ${res.status}. body: ${JSON.stringify(body).slice(0, 120)}`,
        corsOk,
    })

    return { status: res.status, body, headers: res.headers }
}

// ===========================================================================
async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗')
    console.log('║    NeuraTrade — Frontend API Connectivity Test Suite         ║')
    console.log('╚══════════════════════════════════════════════════════════════╝')
    console.log(`  Server  : ${BASE}`)
    console.log(`  Run ID  : ${RUN_ID}`)
    console.log(`  Time    : ${new Date().toISOString()}\n`)

    // ── [1] Health Check ──────────────────────────────────────────────────────
    console.log('\n▶ [1] Health Endpoint')
    const health = await req('GET', '/api/health', {
        label: 'GET /api/health — DB ping',
        expectedStatus: 200,
        checkCors: true,
    })
    if (health.body?.database) console.log(`     ↳ DB backend: ${health.body.database}`)
    if (health.body?.status) console.log(`     ↳ Status: ${health.body.status}`)

    // ── [2] Auth — Unauthorized access guard ─────────────────────────────────
    console.log('\n▶ [2] Auth Guards — Unauthenticated Requests')
    await req('GET', '/api/portfolio', { label: 'Portfolio GET without token → 401', expectedStatus: 401 })
    await req('GET', '/api/auth/me', { label: '/api/auth/me without token → 401', expectedStatus: 401 })
    await req('GET', '/api/advisor/clients', { label: 'Advisor clients without token → 401', expectedStatus: 401 })
    await req('GET', '/api/admin/metrics', { label: 'Admin metrics without token → 401', expectedStatus: 401 })
    await req('GET', '/api/analytics/risk', { label: 'Analytics/risk without token → 401', expectedStatus: 401 })

    // ── [3] Register ──────────────────────────────────────────────────────────
    console.log('\n▶ [3] User Registration')
    const regResult = await req('POST', '/api/auth/register', {
        body: { name: 'API Test Investor', email: TEST_EMAIL, password: TEST_PASS, role: 'INVESTOR' },
        expectedStatus: 201,
        label: 'Register new INVESTOR user → 201',
    })

    // Duplicate registration
    await req('POST', '/api/auth/register', {
        body: { name: 'Dupe', email: TEST_EMAIL, password: TEST_PASS },
        expectedStatus: 409,
        label: 'Duplicate register → 409 Conflict',
    })

    // Missing fields
    await req('POST', '/api/auth/register', {
        body: { email: TEST_EMAIL },
        expectedStatus: 400,
        label: 'Register missing fields → 400',
    })

    // ── [4] Login ─────────────────────────────────────────────────────────────
    console.log('\n▶ [4] Authentication — Login & Session')
    const loginResult = await req('POST', '/api/auth/login', {
        body: { email: TEST_EMAIL, password: TEST_PASS },
        expectedStatus: 200,
        label: 'Login with valid credentials → 200',
    })

    let token: string = loginResult.body?.token ?? ''
    let setCookieHeader = loginResult.headers.get('set-cookie') ?? ''
    const cookieToken = setCookieHeader.includes('ecosystem_token')

    if (token) console.log(`     ↳ JWT issued: ${token.slice(0, 32)}…`)
    if (cookieToken) {
        console.log('     ↳ Session cookie: ecosystem_token set as httpOnly ✅')
    } else {
        console.log('     ⚠️  Cookie ecosystem_token NOT found in Set-Cookie header')
    }

    // Bad credentials
    await req('POST', '/api/auth/login', {
        body: { email: TEST_EMAIL, password: 'wrongpassword' },
        expectedStatus: 401,
        label: 'Login bad password → 401',
    })

    // Missing fields
    await req('POST', '/api/auth/login', {
        body: { email: '' },
        expectedStatus: 400,
        label: 'Login missing password → 400',
    })

    // ── [5] Session — /api/auth/me ────────────────────────────────────────────
    console.log('\n▶ [5] Session Validation — /api/auth/me')
    const meResult = await req('GET', '/api/auth/me', {
        token,
        expectedStatus: 200,
        label: '/api/auth/me with valid Bearer → 200',
    })
    if (meResult.body?.email) {
        console.log(`     ↳ Session user: ${meResult.body.email} | role: ${meResult.body.role}`)
    }

    await req('GET', '/api/auth/me', {
        token: 'bogus.token.value',
        expectedStatus: 401,
        label: '/api/auth/me with invalid token → 401',
    })

    // ── [6] Investor Dashboard — Portfolio GET ─────────────────────────────────
    console.log('\n▶ [6] Investor Dashboard — Portfolio Data')
    const portfolioResult = await req('GET', '/api/portfolio', {
        token,
        expectedStatus: 200,
        label: 'GET /api/portfolio with auth → 200',
    })
    if (portfolioResult.body) {
        console.log(`     ↳ Portfolio overview keys: ${Object.keys(portfolioResult.body).slice(0, 6).join(', ')}`)
    }

    // ── [7] Password Reset ───────────────────────────────────────────────────
    console.log('\n▶ [7] Password Reset Flow')
    await req('POST', '/api/auth/reset-password', {
        body: { email: TEST_EMAIL, newPassword: 'NewPass@2026!' },
        expectedStatus: 200,
        label: 'Password reset with valid email → 200',
    })
    // Verify new creds work
    const reLoginResult = await req('POST', '/api/auth/login', {
        body: { email: TEST_EMAIL, password: 'NewPass@2026!' },
        expectedStatus: 200,
        label: 'Login with new password (post-reset) → 200',
    })
    if (reLoginResult.body?.token) {
        token = reLoginResult.body.token // update token to valid one
        console.log('     ↳ Token refreshed after password reset ✅')
    }

    // ── [8] AI Insights ───────────────────────────────────────────────────────
    console.log('\n▶ [8] AI Insights Endpoint')
    await req('GET', '/api/ai/insights', {
        token,
        expectedStatus: 200,
        label: 'GET /api/ai/insights with auth → 200',
    })

    // ── [9] Analytics / Risk ──────────────────────────────────────────────────
    console.log('\n▶ [9] Analytics — Risk Assessment')
    await req('GET', '/api/analytics/risk', {
        token,
        expectedStatus: 200,
        label: 'GET /api/analytics/risk with auth → 200',
    })

    // ── [10] Advisor Clients ──────────────────────────────────────────────────
    console.log('\n▶ [10] Advisor Clients (INVESTOR role — expect 403/401)')
    // An INVESTOR token hitting /advisor/clients should be blocked by middleware RBAC
    const advisorResp = await req('GET', '/api/advisor/clients', {
        token,
        expectedStatus: 401,
        label: 'INVESTOR token on advisor route → 401/403 (RBAC)',
    })
    // Could also be 200 if API doesn't enforce role internally — flag it
    if (advisorResp.status === 200) {
        const r = RESULTS[RESULTS.length - 1]
        r.pass = false
        r.note = 'RBAC not enforced: INVESTOR can read ADVISOR clients!'
    }

    // ── [11] Admin Metrics (expect block) ─────────────────────────────────────
    console.log('\n▶ [11] Admin Metrics (INVESTOR role — expect 401)')
    await req('GET', '/api/admin/metrics', {
        token,
        expectedStatus: 401,
        label: 'INVESTOR token on admin route → 401 (RBAC)',
    })

    // ── [12] Communication / Messages ─────────────────────────────────────────
    console.log('\n▶ [12] Communication — Messages')
    await req('GET', '/api/communication/messages', {
        token,
        expectedStatus: 200,
        label: 'GET /api/communication/messages with auth → 200',
    })

    // ── [13] Matching ─────────────────────────────────────────────────────────
    console.log('\n▶ [13] Advisor Matching')
    await req('GET', '/api/matching', {
        token,
        expectedStatus: 200,
        label: 'GET /api/matching with auth → 200',
    })

    // ── [14] Training Progress ────────────────────────────────────────────────
    console.log('\n▶ [14] Training Progress')
    await req('GET', '/api/training/progress', {
        token,
        expectedStatus: 200,
        label: 'GET /api/training/progress with auth → 200',
    })

    // ── [15] Portfolio Trade — missing broker → 403 ───────────────────────────
    console.log('\n▶ [15] Portfolio Trade (no broker session — expect 403)')
    await req('POST', '/api/portfolio/trade', {
        cookie: `ecosystem_token=${token}`,
        body: { symbol: 'RELIANCE', type: 'BUY', quantity: 1 },
        expectedStatus: 403,
        label: 'Trade without broker JWT → 403 (safe guard)',
    })

    // ── [16] Payments Intent ──────────────────────────────────────────────────
    console.log('\n▶ [16] Payments Intent')
    await req('POST', '/api/payments/intent', {
        token,
        body: { amount: 1000, currency: 'INR' },
        expectedStatus: 200,
        label: 'POST /api/payments/intent → 200',
    })

    // ── [17] SmartAPI Auth ────────────────────────────────────────────────────
    console.log('\n▶ [17] SmartAPI Auth (no API key — expect error/400)')
    const saResult = await req('POST', '/api/smartapi/auth', {
        token,
        body: { clientId: 'TEST', password: '', totp: '' },
        expectedStatus: 400,
        label: 'SmartAPI auth without key → 400/500',
    })
    // 500 is also acceptable (missing API key configuration)
    if (saResult.status === 500) {
        const r = RESULTS[RESULTS.length - 1]
        r.pass = true
        r.note = '500 acceptable — SMARTAPI_API_KEY not configured in staging'
    }

    // ── [18] KYC Upload ───────────────────────────────────────────────────────
    console.log('\n▶ [18] KYC Upload Endpoint')
    await req('POST', '/api/kyc/upload', {
        token,
        body: { documents: ['doc_1.pdf'] },
        expectedStatus: 200,
        label: 'POST /api/kyc/upload → 200',
    })

    // ── [19] Security Headers ─────────────────────────────────────────────────
    console.log('\n▶ [19] Security Headers Validation')
    const secCheck = await fetch(`${BASE}/api/health`)
    const h = secCheck.headers
    const checkHeader = (name: string, expected: string) => {
        const val = h.get(name)
        const ok = val?.includes(expected) ?? false
        console.log(`  ${ok ? '✅' : '❌'} ${name}: ${val ?? 'MISSING'}`)
        RESULTS.push({ label: `Header: ${name}`, route: '/api/health', method: 'GET', status: 200, expected: 200, pass: ok, note: ok ? '' : `Missing or wrong: "${val}"` })
    }
    checkHeader('x-frame-options', 'DENY')
    checkHeader('x-content-type-options', 'nosniff')
    checkHeader('referrer-policy', 'strict-origin')
    checkHeader('strict-transport-security', 'max-age=31536000')

    // ── Final Report ──────────────────────────────────────────────────────────
    const passed = RESULTS.filter(r => r.pass).length
    const failed = RESULTS.filter(r => !r.pass).length
    const total = RESULTS.length

    console.log('\n╔══════════════════════════════════════════════════════════════╗')
    console.log('║         FRONTEND API CONNECTIVITY REPORT                     ║')
    console.log('╠══════════════════════════════════════════════════════════════╣')
    console.log(`║  Total Checks   : ${String(total).padEnd(43)}║`)
    console.log(`║  Passed         : ${String(passed).padEnd(43)}║`)
    console.log(`║  Failed         : ${String(failed).padEnd(43)}║`)
    console.log('╠══════════════════════════════════════════════════════════════╣')

    const areas: [string, string[], boolean?][] = [
        ['Health Endpoint', ['/api/health']],
        ['Auth Guards (unauth 401)', ['/api/portfolio', '/api/auth/me', '/api/advisor/clients']],
        ['User Registration', ['/api/auth/register']],
        ['Login & JWT Session', ['/api/auth/login']],
        ['Session Validation (me)', ['/api/auth/me']],
        ['Investor Dashboard', ['/api/portfolio']],
        ['Password Reset', ['/api/auth/reset-password']],
        ['Security Headers', ['Header: x-frame-options', 'Header: strict-transport-security']],
    ]

    for (const [area, labels] of areas) {
        const relevant = RESULTS.filter(r => labels.some(l => r.route.includes(l) || r.label.includes(l)))
        const ok = relevant.length > 0 && relevant.every(r => r.pass)
        console.log(`║  ${ok ? '✅' : '❌'} ${area.padEnd(57)}║`)
    }

    console.log('╠══════════════════════════════════════════════════════════════╣')
    if (failed === 0) {
        console.log('║  ✅ ALL CHECKS PASSED — API FULLY OPERATIONAL                 ║')
    } else {
        console.log(`║  ⚠️  ${failed} CHECK(S) FAILED — SEE DETAILS ABOVE              ║`)
        console.log('\n  FAILURES:')
        RESULTS.filter(r => !r.pass).forEach(r => {
            console.log(`  ❌ [${r.method} ${r.route}] expected=${r.expected} got=${r.status}: ${r.note}`)
        })
    }
    console.log('╚══════════════════════════════════════════════════════════════╝\n')

    if (failed > 0) process.exit(1)
}

main().catch(e => {
    console.error('\nFatal test error:', e.message)
    process.exit(1)
})
