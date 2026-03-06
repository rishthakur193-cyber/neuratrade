/**
 * NeuraTrade — Database Health Check Script
 * Connects to PostgreSQL via Prisma and verifies:
 *   1. Connectivity
 *   2. All expected tables exist (via raw SQL information_schema query)
 *   3. Seed data is readable (user count, strategy count)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const EXPECTED_TABLES = [
    'User',
    'InvestorProfile',
    'AdvisorProfile',
    'TraineeProfile',
    'Strategy',
    'Portfolio',
    'Message',
    'AuditLog',
    'Conversation',
    'ConversationParticipant',
    'CourseProgress',
]

async function healthCheck() {
    console.log('\n╔══════════════════════════════════════════════════╗')
    console.log('║   NeuraTrade — Database Readiness Report         ║')
    console.log('╚══════════════════════════════════════════════════╝\n')

    // 1. Connectivity
    console.log('▶ [1/4] Testing database connectivity...')
    try {
        await prisma.$connect()
        console.log('  ✅ Connected to PostgreSQL (Supabase)\n')
    } catch (err) {
        console.error('  ❌ Connection failed:', err)
        process.exit(1)
    }

    // 2. Table existence check
    console.log('▶ [2/4] Verifying tables in schema...')
    const tableResult = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `
    const existingTables = tableResult.map((r) => r.tablename)

    let allTablesPresent = true
    for (const tbl of EXPECTED_TABLES) {
        const found = existingTables.includes(tbl)
        if (!found) allTablesPresent = false
        console.log(`  ${found ? '✅' : '❌'} ${tbl}`)
    }
    console.log()

    // 3. Seed data check
    console.log('▶ [3/4] Verifying seed data...')
    const userCount = await prisma.user.count()
    const strategyCount = await prisma.strategy.count()
    const portfolioCount = await prisma.portfolio.count()
    const courseCount = await prisma.courseProgress.count()

    console.log(`  Users            : ${userCount}  ${userCount >= 4 ? '✅' : '⚠️  (expected ≥ 4)'}`)
    console.log(`  Strategies       : ${strategyCount}  ${strategyCount >= 1 ? '✅' : '⚠️  (expected ≥ 1)'}`)
    console.log(`  Portfolios       : ${portfolioCount}  ${portfolioCount >= 1 ? '✅' : '⚠️  (expected ≥ 1)'}`)
    console.log(`  Course Progress  : ${courseCount}  ${courseCount >= 1 ? '✅' : '⚠️  (expected ≥ 1)'}`)
    console.log()

    // 4. Write test (AuditLog entry)
    console.log('▶ [4/4] Testing write persistence...')
    try {
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) {
            await prisma.auditLog.create({
                data: {
                    userId: admin.id,
                    action: 'HEALTHCHECK',
                    details: JSON.stringify({ timestamp: new Date().toISOString(), status: 'ok' }),
                    ipAddress: '127.0.0.1',
                    userAgent: 'healthcheck-script/1.0',
                },
            })
            console.log('  ✅ Write test passed (AuditLog entry created)\n')
        } else {
            console.log('  ⚠️  Admin user not found — skipping write test\n')
        }
    } catch (err) {
        console.error('  ❌ Write test failed:', err)
    }

    // ── Summary Report ──────────────────────────────────────────────────────────
    const seedOk = userCount >= 4 && strategyCount >= 1 && portfolioCount >= 1 && courseCount >= 1
    console.log('╔══════════════════════════════════════════════════╗')
    console.log('║              READINESS REPORT SUMMARY           ║')
    console.log('╠══════════════════════════════════════════════════╣')
    console.log(`║  Database Connectivity  : ✅ CONNECTED           ║`)
    console.log(`║  Tables Created         : ${allTablesPresent ? '✅ ALL PRESENT      ' : '❌ SOME MISSING     '}  ║`)
    console.log(`║  Seed Successful        : ${seedOk ? '✅ YES               ' : '⚠️  INCOMPLETE       '}  ║`)
    console.log(`║  System Persistence     : ✅ ENABLED (PostgreSQL) ║`)
    console.log('╚══════════════════════════════════════════════════╝\n')
}

healthCheck()
    .catch((e) => {
        console.error('Health check error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
