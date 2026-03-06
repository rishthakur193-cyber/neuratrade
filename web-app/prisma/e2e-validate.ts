/**
 * NeuraTrade — Full End-to-End Database Validation Script
 * =========================================================
 * Checks:
 *  1. Read/write on all 11 tables
 *  2. Auth: create user with bcrypt password → verify login hash
 *  3. Investor profile insertion
 *  4. Portfolio creation workflow (Advisor → Strategy → Investor → Portfolio)
 *  5. Audit logging
 *  6. Foreign key relationship integrity
 *  7. Permission / error surface report
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ── Colour helpers ──────────────────────────────────────────────────────────
const GREEN = (s: string) => `\x1b[32m${s}\x1b[0m`
const RED = (s: string) => `\x1b[31m${s}\x1b[0m`
const YELLOW = (s: string) => `\x1b[33m${s}\x1b[0m`
const CYAN = (s: string) => `\x1b[36m${s}\x1b[0m`
const BOLD = (s: string) => `\x1b[1m${s}\x1b[0m`

// ── Result tracker ──────────────────────────────────────────────────────────
type CheckResult = { label: string; status: 'pass' | 'fail' | 'warn'; detail: string }
const results: CheckResult[] = []

function pass(label: string, detail: string) {
    results.push({ label, status: 'pass', detail })
    console.log(`  ${GREEN('✅')} ${label}: ${detail}`)
}
function fail(label: string, detail: string) {
    results.push({ label, status: 'fail', detail })
    console.log(`  ${RED('❌')} ${label}: ${detail}`)
}
function warn(label: string, detail: string) {
    results.push({ label, status: 'warn', detail })
    console.log(`  ${YELLOW('⚠️ ')} ${label}: ${detail}`)
}

// ── Unique test suffix to avoid clashing with seed data ────────────────────
const RUN_ID = `e2e_${Date.now()}`

// ===========================================================================
async function main() {
    console.log(BOLD('\n╔══════════════════════════════════════════════════════════╗'))
    console.log(BOLD('║     NeuraTrade — Full E2E Database Validation             ║'))
    console.log(BOLD('╚══════════════════════════════════════════════════════════╝'))
    console.log(CYAN(`  Run ID : ${RUN_ID}`))
    console.log(CYAN(`  Time   : ${new Date().toISOString()}\n`))

    // ── [1] Connectivity ──────────────────────────────────────────────────────
    console.log(BOLD('\n▶ [1] Connectivity'))
    try {
        await prisma.$queryRaw`SELECT 1`
        pass('Connection', 'PostgreSQL reachable via Supabase pooler')
    } catch (e: any) {
        fail('Connection', e.message)
        console.error(RED('\nFatal: cannot reach database. Aborting.\n'))
        process.exit(1)
    }

    // ── [2] Auth — create user, verify bcrypt hash ───────────────────────────
    console.log(BOLD('\n▶ [2] Authentication — User Creation & Password Hashing'))
    let authUser: Awaited<ReturnType<typeof prisma.user.create>> | null = null
    const authEmail = `${RUN_ID}@test.neuratrade`
    const rawPass = 'TestPass@E2E#99'
    try {
        const hash = await bcrypt.hash(rawPass, 10)
        authUser = await prisma.user.create({
            data: {
                name: 'E2E Test User',
                email: authEmail,
                passwordHash: hash,
                role: 'INVESTOR',
                kycStatus: 'PENDING',
            },
        })
        pass('User create', `id=${authUser.id.slice(0, 8)}…  email=${authUser.email}`)

        // Verify hash matches
        const hashOk = await bcrypt.compare(rawPass, authUser.passwordHash)
        hashOk
            ? pass('bcrypt verify', 'Password hash round-trip matches')
            : fail('bcrypt verify', 'Hash mismatch!')

        // Read back
        const fetched = await prisma.user.findUnique({ where: { email: authEmail } })
        fetched
            ? pass('User read-back', `role=${fetched.role} kycStatus=${fetched.kycStatus}`)
            : fail('User read-back', 'User not found after create')

        // Update
        const updated = await prisma.user.update({
            where: { id: authUser.id },
            data: { kycStatus: 'VERIFIED' },
        })
        updated.kycStatus === 'VERIFIED'
            ? pass('User update', 'kycStatus → VERIFIED')
            : fail('User update', `Unexpected kycStatus: ${updated.kycStatus}`)

    } catch (e: any) {
        fail('Auth workflow', e.message)
    }

    // ── [3] InvestorProfile — insert & read ──────────────────────────────────
    console.log(BOLD('\n▶ [3] Investor Profile Insertion'))
    let investorProfile: { id: string } | null = null
    try {
        if (!authUser) throw new Error('No authUser — skipping')
        investorProfile = await prisma.investorProfile.create({
            data: {
                userId: authUser.id,
                riskTolerance: 'High',
                totalInvested: 1_000_000,
                currentValue: 1_240_000,
            },
        })
        pass('InvestorProfile create', `id=${investorProfile.id.slice(0, 8)}…`)

        const ip = await prisma.investorProfile.findUnique({
            where: { id: investorProfile.id },
            include: { user: true },
        })
        if (ip) {
            pass('InvestorProfile read', `totalInvested=₹${ip.totalInvested.toLocaleString()}`)
            pass('FK User → InvestorProfile', `user.name="${ip.user.name}"`)
        } else {
            fail('InvestorProfile read', 'Not found')
        }
    } catch (e: any) {
        fail('InvestorProfile workflow', e.message)
    }

    // ── [4] Portfolio Creation Workflow ──────────────────────────────────────
    console.log(BOLD('\n▶ [4] Portfolio Creation Workflow'))
    let e2eAdvisorUser: Awaited<ReturnType<typeof prisma.user.create>> | null = null
    let e2eStrategy: { id: string } | null = null
    let e2ePortfolio: { id: string } | null = null
    try {
        // Step 4a — create advisor
        e2eAdvisorUser = await prisma.user.create({
            data: {
                name: 'E2E Advisor',
                email: `advisor_${RUN_ID}@test.neuratrade`,
                passwordHash: await bcrypt.hash('adv_pass_123', 10),
                role: 'ADVISOR',
                kycStatus: 'VERIFIED',
                advisorProfile: {
                    create: {
                        sebiRegNo: `INA_E2E_${RUN_ID.slice(-8)}`,
                        tier: 'Registered',
                        aumManaged: 10_000_000,
                        alphaGenerated: 9.5,
                        rating: 4.2,
                        isVerified: true,
                    },
                },
            },
            include: { advisorProfile: true },
        })
        pass('Advisor create', `id=${e2eAdvisorUser.id.slice(0, 8)}…  sebiRegNo=${e2eAdvisorUser.advisorProfile?.sebiRegNo}`)

        // Step 4b — create strategy under advisor
        e2eStrategy = await prisma.strategy.create({
            data: {
                advisorId: e2eAdvisorUser.advisorProfile!.id,
                name: `E2E Momentum Fund (${RUN_ID})`,
                type: 'Algorithmic',
                riskLevel: 'Medium',
                cagr: 18.5,
                minInvestment: 100_000,
                description: 'End-to-end test strategy.',
                tags: ['E2E', 'Test'],
                isActive: true,
            },
        })
        pass('Strategy create', `id=${e2eStrategy.id.slice(0, 8)}…`)

        // Step 4c — link investor to strategy via portfolio
        if (!investorProfile) throw new Error('No investorProfile — cannot create portfolio')
        e2ePortfolio = await prisma.portfolio.create({
            data: {
                investorId: investorProfile.id,
                strategyId: e2eStrategy.id,
                investedAmount: 500_000,
                currentValue: 587_500,
            },
        })
        pass('Portfolio create', `id=${e2ePortfolio.id.slice(0, 8)}…`)

        // Step 4d — read portfolio with full relation chain
        const fullPortfolio = await prisma.portfolio.findUnique({
            where: { id: e2ePortfolio.id },
            include: {
                investor: { include: { user: true } },
                strategy: { include: { advisor: { include: { user: true } } } },
            },
        })
        if (fullPortfolio) {
            pass('Portfolio deep-read', `investor="${fullPortfolio.investor.user.name}" → strategy="${fullPortfolio.strategy.name}"`)
            pass('FK chain Portfolio→Investor→User', `user.email=${fullPortfolio.investor.user.email}`)
            pass('FK chain Portfolio→Strategy→Advisor→User', `user.email=${fullPortfolio.strategy.advisor.user.email}`)
        } else {
            fail('Portfolio deep-read', 'Not found')
        }

    } catch (e: any) {
        fail('Portfolio workflow', e.message)
    }

    // ── [5] Messaging — Message table CRUD ────────────────────────────────────
    console.log(BOLD('\n▶ [5] Message Table CRUD'))
    try {
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (!admin || !authUser) throw new Error('Missing users for message test')

        const msg = await prisma.message.create({
            data: {
                senderId: admin.id,
                receiverId: authUser.id,
                content: `E2E test message — run ${RUN_ID}`,
                isAiSummary: false,
            },
        })
        pass('Message create', `id=${msg.id.slice(0, 8)}…`)

        const fetched = await prisma.message.findUnique({ where: { id: msg.id } })
        fetched
            ? pass('Message read', `content="${fetched.content.slice(0, 40)}…"`)
            : fail('Message read', 'Not found')

        // Cleanup
        await prisma.message.delete({ where: { id: msg.id } })
        pass('Message delete', 'Deleted successfully')

    } catch (e: any) {
        fail('Message table', e.message)
    }

    // ── [6] Audit Logging ─────────────────────────────────────────────────────
    console.log(BOLD('\n▶ [6] Audit Log Verification'))
    try {
        if (!authUser) throw new Error('No authUser')
        const log = await prisma.auditLog.create({
            data: {
                userId: authUser.id,
                action: 'E2E_VALIDATION',
                details: JSON.stringify({ runId: RUN_ID, checks: 'full', timestamp: new Date().toISOString() }),
                ipAddress: '127.0.0.1',
                userAgent: 'e2e-validate/1.0',
            },
        })
        pass('AuditLog create', `id=${log.id.slice(0, 8)}…  action=${log.action}`)

        const fetched = await prisma.auditLog.findUnique({
            where: { id: log.id },
            include: { user: true },
        })
        if (fetched) {
            pass('AuditLog read', `createdAt=${fetched.createdAt.toISOString()}`)
            pass('FK AuditLog→User', `user.email=${fetched.user.email}`)
        } else {
            fail('AuditLog read', 'Not found')
        }

        // Count total audit logs
        const count = await prisma.auditLog.count()
        pass('AuditLog count', `Total entries in table: ${count}`)

    } catch (e: any) {
        fail('Audit log', e.message)
    }

    // ── [7] Conversation / ConversationParticipant CRUD ──────────────────────
    console.log(BOLD('\n▶ [7] Conversation Table CRUD'))
    try {
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (!admin || !authUser) throw new Error('Missing users for conversation test')

        const conv = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId: admin.id },
                        { userId: authUser.id },
                    ],
                },
            },
            include: { participants: { include: { user: true } } },
        })
        pass('Conversation create', `id=${conv.id.slice(0, 8)}…  participants=${conv.participants.length}`)
        pass('ConversationParticipant FK', `users: ${conv.participants.map(p => p.user.role).join(', ')}`)

        // Cleanup
        await prisma.conversationParticipant.deleteMany({ where: { conversationId: conv.id } })
        await prisma.conversation.delete({ where: { id: conv.id } })
        pass('Conversation delete', 'Cascade-deleted participants and conversation')

    } catch (e: any) {
        fail('Conversation table', e.message)
    }

    // ── [8] CourseProgress — TraineeProfile CRUD ─────────────────────────────
    console.log(BOLD('\n▶ [8] Trainee & CourseProgress CRUD'))
    try {
        const traineeUser = await prisma.user.create({
            data: {
                name: 'E2E Trainee',
                email: `trainee_${RUN_ID}@test.neuratrade`,
                passwordHash: await bcrypt.hash('trainee_e2e', 10),
                role: 'TRAINEE',
                kycStatus: 'PENDING',
                traineeProfile: {
                    create: { nismProgress: 65, milestonesDone: 6 },
                },
            },
            include: { traineeProfile: true },
        })
        pass('TraineeProfile create', `id=${traineeUser.traineeProfile?.id.slice(0, 8)}…  nismProgress=${traineeUser.traineeProfile?.nismProgress}%`)

        const course = await prisma.courseProgress.create({
            data: {
                userId: traineeUser.id,
                courseId: 'E2E_TEST_COURSE',
                progress: 65.0,
            },
        })
        pass('CourseProgress create', `courseId=${course.courseId}  progress=${course.progress}%`)

        // Unique constraint test (duplicate userId+courseId should fail)
        try {
            await prisma.courseProgress.create({
                data: {
                    userId: traineeUser.id,
                    courseId: 'E2E_TEST_COURSE',
                    progress: 0,
                },
            })
            fail('Unique constraint (CourseProgress)', 'Duplicate insert succeeded — constraint NOT enforced')
        } catch {
            pass('Unique constraint (CourseProgress)', 'Duplicate correctly rejected by DB')
        }

        // Cleanup trainee
        await prisma.courseProgress.deleteMany({ where: { userId: traineeUser.id } })
        await prisma.traineeProfile.delete({ where: { userId: traineeUser.id } })
        await prisma.user.delete({ where: { id: traineeUser.id } })
        pass('Trainee cleanup', 'All trainee test records removed')

    } catch (e: any) {
        fail('Trainee/CourseProgress workflow', e.message)
    }

    // ── [9] FK Constraint — orphan record rejection ───────────────────────────
    console.log(BOLD('\n▶ [9] Foreign Key Constraint — Orphan Rejection'))
    try {
        await prisma.auditLog.create({
            data: {
                userId: '00000000-0000-0000-0000-000000000000', // non-existent user
                action: 'ORPHAN_TEST',
            },
        })
        fail('FK orphan rejection', 'Orphan AuditLog insert succeeded — FK NOT enforced!')
    } catch {
        pass('FK orphan rejection', 'Non-existent userId correctly rejected by DB')
    }

    // ── [10] Cleanup E2E test data ────────────────────────────────────────────
    console.log(BOLD('\n▶ [10] Cleanup — Removing E2E Test Records'))
    try {
        if (e2ePortfolio) {
            await prisma.portfolio.delete({ where: { id: e2ePortfolio.id } })
            pass('Portfolio cleanup', 'Deleted')
        }
        if (e2eStrategy) {
            await prisma.strategy.delete({ where: { id: e2eStrategy.id } })
            pass('Strategy cleanup', 'Deleted')
        }
        if (e2eAdvisorUser) {
            await prisma.advisorProfile.deleteMany({ where: { userId: e2eAdvisorUser.id } })
            await prisma.user.delete({ where: { id: e2eAdvisorUser.id } })
            pass('E2E Advisor cleanup', 'Deleted')
        }
        if (investorProfile) {
            await prisma.investorProfile.delete({ where: { id: investorProfile.id } })
            pass('InvestorProfile cleanup', 'Deleted')
        }
        if (authUser) {
            await prisma.auditLog.deleteMany({ where: { userId: authUser.id } })
            await prisma.user.delete({ where: { id: authUser.id } })
            pass('E2E Auth User cleanup', 'Deleted (incl. audit logs)')
        }
    } catch (e: any) {
        warn('Cleanup', `Partial cleanup failure: ${e.message}`)
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    const passed = results.filter(r => r.status === 'pass').length
    const failed = results.filter(r => r.status === 'fail').length
    const warned = results.filter(r => r.status === 'warn').length
    const total = results.length

    console.log(BOLD('\n╔══════════════════════════════════════════════════════════╗'))
    console.log(BOLD('║         E2E DATABASE VALIDATION REPORT                   ║'))
    console.log(BOLD('╠══════════════════════════════════════════════════════════╣'))
    console.log(`║  Total Checks   : ${String(total).padEnd(38)}║`)
    console.log(`║  ${GREEN('Passed')}          : ${String(passed).padEnd(38)}║`)
    console.log(`║  ${YELLOW('Warnings')}        : ${String(warned).padEnd(38)}║`)
    console.log(`║  ${RED('Failed')}          : ${String(failed).padEnd(38)}║`)
    console.log(BOLD('╠══════════════════════════════════════════════════════════╣'))

    const areas = [
        ['Read/Write (all tables)', results.filter(r => r.label.includes('read') || r.label.includes('create') || r.label.includes('write')).every(r => r.status !== 'fail')],
        ['Auth — User Creation & bcrypt', results.filter(r => r.label.includes('bcrypt') || r.label.includes('User create')).every(r => r.status !== 'fail')],
        ['Investor Profile Insertion', results.filter(r => r.label.includes('InvestorProfile')).every(r => r.status !== 'fail')],
        ['Portfolio Creation Workflow', results.filter(r => r.label.includes('Portfolio') || r.label.includes('Strategy') || r.label.includes('Advisor')).every(r => r.status !== 'fail')],
        ['Audit Logging', results.filter(r => r.label.includes('AuditLog')).every(r => r.status !== 'fail')],
        ['Foreign Key Relationships', results.filter(r => r.label.includes('FK') || r.label.includes('constraint')).every(r => r.status !== 'fail')],
    ] as [string, boolean][]

    for (const [area, ok] of areas) {
        const icon = ok ? GREEN('✅') : RED('❌')
        console.log(`║  ${icon} ${area.padEnd(53)}║`)
    }

    console.log(BOLD('╠══════════════════════════════════════════════════════════╣'))
    const allGood = failed === 0
    const status = allGood ? GREEN('ALL CHECKS PASSED — DATABASE FULLY VALIDATED') : RED('VALIDATION FAILED — SEE ABOVE FOR DETAILS')
    console.log(`║  ${status.padEnd(allGood ? 70 : 67)}  ║`)
    console.log(BOLD('╚══════════════════════════════════════════════════════════╝\n'))

    if (failed > 0) process.exit(1)
}

main()
    .catch((e) => {
        console.error(RED('\nUnhandled error:'), e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
