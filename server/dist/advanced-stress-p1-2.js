import prisma from './lib/prisma.js';
import { AdvisorDiscoveryService } from './services/AdvisorDiscoveryService.js';
import { randomUUID } from 'crypto';
async function runPhase1And2() {
    console.log('--- ADVANCED STRESS TEST: PHASE 1 & 2 ---');
    // === PHASE 1: MASS USER SIMULATION ===
    console.log('\n[PHASE 1] Creating 10 Advisors and 50 Investors...');
    const advisorIds = [];
    const investorIds = [];
    // Create 10 Advisors
    for (let i = 0; i < 10; i++) {
        const advUser = await prisma.user.create({
            data: {
                id: randomUUID(),
                name: `Stress Advisor ${i}`,
                email: `adv.${Date.now()}.${i}@stress.com`,
                passwordHash: 'hashed',
                role: 'ADVISOR',
                advisorProfile: {
                    create: {
                        sebiRegNo: `SEBI-${Date.now()}-${i}`,
                        isVerified: true,
                        status: 'VERIFIED',
                        classification: i % 2 === 0 ? 'SEBI_REGISTERED' : 'COMMUNITY_STRATEGIST'
                    }
                }
            },
            include: { advisorProfile: true }
        });
        advisorIds.push(advUser.id);
    }
    console.log(`✅ Created 10 Advisors.`);
    // Create 50 Investors
    const riskLevels = ['Low', 'Moderate', 'High'];
    const capitalRanges = ['Low', 'Medium', 'High'];
    const investorPromises = [];
    for (let i = 0; i < 50; i++) {
        const riskScore = Math.floor(Math.random() * 100);
        const capitalRange = capitalRanges[i % 3];
        investorPromises.push(prisma.user.create({
            data: {
                id: randomUUID(),
                name: `Stress Investor ${i}`,
                email: `inv.${Date.now()}.${i}@stress.com`,
                passwordHash: 'hashed',
                role: 'INVESTOR',
                investorProfile: {
                    create: {
                        riskTolerance: riskLevels[i % 3],
                        capitalRange: capitalRange,
                        riskScore: riskScore
                    }
                }
            }
        }));
    }
    // Process in batches to avoid locking issues though 50 is small
    const createdInvestors = await Promise.all(investorPromises);
    createdInvestors.forEach(inv => investorIds.push(inv.id));
    console.log(`✅ Created 50 Investors.`);
    // === PHASE 2: ADVISOR MARKETPLACE TEST ===
    console.log('\n[PHASE 2] Testing Advisor Discovery for 50 Investors...');
    let totalTime = 0;
    let maxTime = 0;
    let successCount = 0;
    let failureCount = 0;
    let duplicateErrors = 0;
    for (const invId of investorIds) {
        const start = performance.now();
        try {
            const results = await AdvisorDiscoveryService.discoverAdvisors(invId);
            const duration = performance.now() - start;
            totalTime += duration;
            if (duration > maxTime)
                maxTime = duration;
            if (duration >= 500) {
                console.warn(`⚠️ Warning: Query took ${duration.toFixed(2)}ms (Limit: 500ms)`);
                failureCount++;
            }
            else {
                successCount++;
            }
            // Verify compatibility score calculated
            if (results.length > 0 && results[0].compatibilityScore === undefined) {
                console.error(`❌ Compatibility score missing!`);
            }
            // Check for duplicates
            const ids = results.map(r => r.advisorId);
            const uniqueIds = new Set(ids);
            if (uniqueIds.size !== ids.length) {
                duplicateErrors++;
            }
        }
        catch (error) {
            console.error(`❌ Error fetching discovery for investor ${invId}:`, error.message);
            failureCount++;
        }
    }
    const avgTime = totalTime / investorIds.length;
    console.log(`\n--- Discovery Marketplace Test Results ---`);
    console.log(`Avg Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${maxTime.toFixed(2)}ms`);
    console.log(`Success (<500ms):  ${successCount}/50`);
    console.log(`Failures/Timeouts: ${failureCount}/50`);
    console.log(`Duplicate Errors:  ${duplicateErrors}`);
    if (avgTime < 500 && duplicateErrors === 0) {
        console.log(`✅ Phase 2 Completed Successfully.`);
    }
    else {
        console.error(`❌ Phase 2 Failed SLAs.`);
    }
    console.log('\nTest Complete.');
    await prisma.$disconnect();
}
runPhase1And2().catch(e => {
    console.error(e);
    prisma.$disconnect();
});
