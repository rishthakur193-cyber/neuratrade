import prisma from './lib/prisma.js';
import { randomUUID } from 'crypto';

async function runAdminTest() {
    console.log('--- PHASE 10: ADMIN PANEL TEST ---');

    console.log('\n[1] Creating a Pending Advisor...');
    const advisorUser = await prisma.user.create({
        data: {
            id: randomUUID(),
            name: 'Pending Admin Test Advisor',
            email: `admin.test.${Date.now()}@test.com`,
            passwordHash: 'hashedpassword',
            role: 'ADVISOR',
            advisorProfile: {
                create: {
                    sebiRegNo: `SEBI-ADMIN-${Date.now()}`,
                    isVerified: false,
                    status: 'PENDING',
                    classification: 'COMMUNITY_STRATEGIST'
                }
            }
        },
        include: { advisorProfile: true }
    });
    const advisorProfileId = advisorUser.advisorProfile!.id;
    console.log('✅ Pending Advisor Created:', advisorUser.email);

    console.log('\n[2] Fetching System Metrics (Before Verification)...');
    let userCount = await prisma.user.count();
    let verifiedAdvisors = await prisma.advisorProfile.count({ where: { isVerified: true } });
    let pendingVerification = await prisma.advisorProfile.findMany({
        where: { isVerified: false },
        include: { user: { select: { name: true, email: true } } }
    });

    console.log(`   Total Users: ${userCount}`);
    console.log(`   Verified Advisors: ${verifiedAdvisors}`);
    console.log(`   Pending Queue Length: ${pendingVerification.length}`);

    const isOurAdvisorPending = pendingVerification.some(a => a.id === advisorProfileId);
    if (isOurAdvisorPending) {
        console.log('✅ Advisor found in pending queue.');
    } else {
        console.error('❌ Advisor missing from pending queue!');
    }

    console.log('\n[3] Admin Verifying Advisor...');
    const updated = await prisma.advisorProfile.update({
        where: { id: advisorProfileId },
        data: {
            isVerified: true,
            status: 'VERIFIED',
            verifiedAt: new Date()
        }
    });
    console.log(`✅ Advisor verified successfully. New Status: ${updated.status}`);

    console.log('\n[4] Fetching System Metrics (After Verification)...');
    userCount = await prisma.user.count();
    verifiedAdvisors = await prisma.advisorProfile.count({ where: { isVerified: true } });
    pendingVerification = await prisma.advisorProfile.findMany({
        where: { isVerified: false },
        include: { user: { select: { name: true, email: true } } }
    });

    console.log(`   Total Users: ${userCount}`);
    console.log(`   Verified Advisors: ${verifiedAdvisors}`);
    console.log(`   Pending Queue Length: ${pendingVerification.length}`);

    const isOurAdvisorPendingAfter = pendingVerification.some(a => a.id === advisorProfileId);
    if (!isOurAdvisorPendingAfter) {
        console.log('✅ Advisor properly removed from pending queue.');
    } else {
        console.error('❌ Advisor still in pending queue!');
    }

    console.log('\nTest Complete.');
}

runAdminTest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
