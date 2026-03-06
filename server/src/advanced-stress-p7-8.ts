import prisma from './lib/prisma.js';
import { BrokerService } from './services/BrokerService.js';
import { AdvisorDiscoveryService } from './services/AdvisorDiscoveryService.js';
import { MarketDecisionFeedService } from './services/MarketDecisionFeedService.js';

async function runPhase7And8() {
    console.log('--- ADVANCED STRESS TEST: PHASE 7 & 8 ---');

    // === PHASE 7: BROKER EXECUTION SIMULATION ===
    console.log('\n[PHASE 7] Broker Execution Simulation (AngelOne, Zerodha, Dhan)...');
    BrokerService.initialize();

    const mockSignal = { symbol: 'INFY', entryPrice: 1500, stopLoss: 1480, target: 1550 };
    const brokers = ['AngelOne', 'Zerodha', 'Dhan'];
    let brokerSuccess = 0;

    for (const broker of brokers) {
        try {
            const res = await BrokerService.executeSignal(broker, mockSignal);
            console.log(`✅ [${broker}] Response:`, res.status || res);
            brokerSuccess++;
        } catch (e: any) {
            console.error(`❌ [${broker}] Error:`, e.message);
        }
    }

    if (brokerSuccess === brokers.length) {
        console.log(`✅ Phase 7: All broker integrations simulated successfully.`);
    }

    // === PHASE 8: DATABASE STABILITY TEST (STRESS QUERIES) ===
    console.log('\n[PHASE 8] Database Stability Test (Read Stress)...');

    // Get an investor to use for feed generation
    const investor = await prisma.user.findFirst({ where: { role: 'INVESTOR' } });
    if (!investor) throw new Error('No investor found. Run Phase 1 first.');

    console.log('Running 50 parallel Feed Fetches...');
    const feedPromises = [];
    const feedStart = performance.now();
    for (let i = 0; i < 50; i++) {
        feedPromises.push(MarketDecisionFeedService.getPersonalizedFeed(investor.id));
    }
    await Promise.all(feedPromises);
    const feedTime = performance.now() - feedStart;
    console.log(`✅ 50 Feed fetches completed in ${feedTime.toFixed(2)}ms.`);

    console.log('Running 50 parallel Discovery Rankings...');
    const rankPromises = [];
    const rankStart = performance.now();
    for (let i = 0; i < 50; i++) {
        rankPromises.push(AdvisorDiscoveryService.discoverAdvisors(investor.id));
    }
    await Promise.all(rankPromises);
    const rankTime = performance.now() - rankStart;
    console.log(`✅ 50 Discovery rankings completed in ${rankTime.toFixed(2)}ms.`);

    console.log('\n[Database Assertions Check]');
    const isStable = feedTime < 5000 && rankTime < 5000;
    if (isStable) {
        console.log('✅ Phase 8: Database Query Stability Confirmed under aggressive load.');
    } else {
        console.warn('⚠️ Phase 8: Queries took longer than expected. DB might be bottlenecking.');
    }

    console.log('\nTest Complete.');
}

runPhase7And8().catch(console.error).finally(() => prisma.$disconnect());
