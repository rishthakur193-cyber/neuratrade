import prisma from './lib/prisma.js';
import { SignalService } from './services/SignalService.js';
import { MarketDecisionFeedService } from './services/MarketDecisionFeedService.js';
import { randomUUID } from 'crypto';
async function runStressTest() {
    console.log('--- PHASE 11: STRESS TEST ---');
    console.log('\n[1] Setup Stress Test Advisor...');
    const advisorUser = await prisma.user.create({
        data: {
            id: randomUUID(),
            name: 'Stress Test Advisor',
            email: `stress.advisor.${Date.now()}@test.com`,
            passwordHash: 'hashedpassword',
            role: 'ADVISOR',
            advisorProfile: {
                create: {
                    sebiRegNo: `SEBI-STRESS-${Date.now()}`,
                    isVerified: true,
                    status: 'VERIFIED',
                    classification: 'COMMUNITY_STRATEGIST'
                }
            }
        },
        include: { advisorProfile: true }
    });
    const advisorProfileId = advisorUser.advisorProfile.id;
    console.log('✅ Stress Advisor Created');
    // Create an investor for testing feed fetching
    const investorUser = await prisma.user.create({
        data: {
            id: randomUUID(),
            name: 'Stress Test Investor',
            email: `stress.investor.${Date.now()}@test.com`,
            passwordHash: 'hashedpassword',
            role: 'INVESTOR',
            investorProfile: { create: {} }
        }
    });
    console.log('\n[2] Simulating Rapid Signal Publication (20 signals concurrently)...');
    const startPubTime = Date.now();
    const promises = [];
    for (let i = 0; i < 20; i++) {
        promises.push(SignalService.publishSignal(advisorProfileId, {
            symbol: `STRESS${i}`,
            entryPrice: 100 + i,
            stopLoss: 90 + i,
            target: 120 + i,
            riskLevel: 'HIGH',
            tradeReason: `Rapid simulated signal ${i}`,
            isDirectSignal: false,
            disclaimerAccepted: true
        }));
    }
    await Promise.all(promises);
    const pubDuration = Date.now() - startPubTime;
    console.log(`✅ 20 signals published successfully in ${pubDuration}ms!`);
    console.log('\n[3] Fetching Active Signals directly...');
    const startFetchTime = Date.now();
    const activeSignals = await SignalService.getActiveSignals();
    const fetchDuration = Date.now() - startFetchTime;
    console.log(`✅ Fetch returned ${activeSignals.length} active signals in ${fetchDuration}ms!`);
    console.log('\n[4] Fetching Market Decision Feed...');
    const startFeedTime = Date.now();
    const feed = await MarketDecisionFeedService.getPersonalizedFeed(investorUser.id);
    const feedDuration = Date.now() - startFeedTime;
    console.log(`✅ Feed returned ${feed.length} items in ${feedDuration}ms!`);
    console.log('\n[5] Cached Result Benchmark...');
    const startCacheTime = Date.now();
    const cachedSignals = await SignalService.getActiveSignals();
    const cacheDuration = Date.now() - startCacheTime;
    console.log(`✅ Cached fetch took ${cacheDuration}ms. (Signals: ${cachedSignals.length})`);
    console.log('\nTest Complete.');
}
runStressTest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
