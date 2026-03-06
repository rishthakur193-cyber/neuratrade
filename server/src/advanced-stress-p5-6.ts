import prisma from './lib/prisma.js';
import { SignalService } from './services/SignalService.js';

async function runPhase5And6() {
    console.log('--- ADVANCED STRESS TEST: PHASE 5 & 6 ---');

    console.log('\n[1] Fetching active stress test signals...');
    const activeSignals = await prisma.advisorRecommendation.findMany({
        where: { isActiveSignal: true, symbol: { startsWith: 'LOADTST' } },
        take: 200
    });

    if (activeSignals.length === 0) {
        throw new Error('No active test signals found. Ensure Phase 3 ran first.');
    }

    console.log(`✅ Found ${activeSignals.length} Active Signals to verify.`);

    // === PHASE 5: SIGNAL VERIFICATION ENGINE TEST ===
    console.log('\n[PHASE 5] Simulating Target/StopLoss hits & Auto-Closure...');
    const closurePromises = [];
    const startTime = performance.now();

    for (let i = 0; i < activeSignals.length; i++) {
        const signal = activeSignals[i];

        // Simulate a 70% win rate (Target Hit), 30% loss rate (SL Hit)
        const isWin = i % 10 < 7;
        const simulatedExitPrice = isWin ? signal.target : signal.stopLoss;

        closurePromises.push(
            SignalService.closeSignal(signal.id, simulatedExitPrice)
        );
    }

    try {
        await Promise.all(closurePromises);
    } catch (e: any) {
        console.error('❌ Signal Closure Error:', e.message);
    }
    const closureDuration = performance.now() - startTime;
    console.log(`✅ Closed ${activeSignals.length} signals concurrently in ${closureDuration.toFixed(2)}ms.`);

    const remainingSignals = await prisma.advisorRecommendation.count({
        where: { isActiveSignal: true, symbol: { startsWith: 'LOADTST' } }
    });

    if (remainingSignals === 0) {
        console.log('✅ Auto-closure successfully updated all signal statuses.');
    } else {
        console.error('❌ Some signals failed to close.');
    }

    // === PHASE 6: PERFORMANCE ENGINE TEST ===
    console.log('\n[PHASE 6] Validating Auto-Computed Performance Metrics & Trust Scores...');

    const uniqueAdvisorIds = [...new Set(activeSignals.map(s => s.advisorId))];
    let metricsVerified = 0;

    for (const advisorId of uniqueAdvisorIds) {
        const perf = await prisma.advisorPerformance.findUnique({
            where: { advisorId }
        });
        const trust = await prisma.advisorTrustScore.findUnique({
            where: { advisorId }
        });

        if (perf && trust) {
            metricsVerified++;
            console.log(`   Advisor ${advisorId.substring(0, 8)}... -> WinRate: ${perf.winRate.toFixed(1)}%, AvgReturn: ${perf.avgReturnPerTrade.toFixed(2)}%, TrustScore: ${trust.overallScore.toFixed(0)}/100`);

            // Basic sanity checks
            if (perf.totalTrades === 0) console.error('❌ Performance engine didn\'t tally trades.');
            if (trust.overallScore === 0) console.error('❌ Trust score engine didn\'t compute score.');
        } else {
            console.error('❌ Missing performance/trust profiles for advisor.');
        }
    }

    if (metricsVerified === uniqueAdvisorIds.length) {
        console.log(`✅ Performance and Trust Metrics successfully recalculated for all ${metricsVerified} advisors.`);
    }

    console.log('\nTest Complete.');
}

runPhase5And6().catch(e => {
    console.error(e);
}).finally(() => {
    prisma.$disconnect();
});
