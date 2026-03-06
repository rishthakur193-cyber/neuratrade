
import prisma from './lib/prisma.js';
import { SignalService } from './services/SignalService.js';
import { TrustScoreService } from './services/TrustScoreService.js';
import { randomUUID } from 'crypto';

async function e2eSimulation() {
    console.log('--- STARTING END-TO-END SYSTEM SIMULATION ---');
    try {
        const advisorId = 'adv-profile-001'; // From seed
        const symbol = 'RELIANCE';

        // 1. Publish Signal
        console.log(`[E2E] Phase 1: Advisor publishing direct signal for ${symbol}...`);
        const signal = await SignalService.publishSignal(advisorId, {
            symbol,
            entryPrice: 2500,
            stopLoss: 2450,
            target: 2600,
            riskLevel: 'MEDIUM',
            tradeReason: 'Bullish breakout on volume',
            isDirectSignal: true,
            disclaimerAccepted: true
        });
        console.log('✅ Signal Published:', signal.id);

        // 2. Simulate Result (WIN)
        console.log(`[E2E] Phase 2: Simulating signal closure at target (WIN)...`);
        const closedSignal = await SignalService.closeSignal(signal.id, 2605);
        console.log('✅ Signal Closed. Result:', (closedSignal as any).result, '| Returns:', (closedSignal as any).returnPct.toFixed(2), '%');

        // 3. Verify Trust Score Recalculation
        console.log(`[E2E] Phase 3: Verifying Trust Score and Performance updates...`);
        const performance = await prisma.advisorPerformance.findUnique({ where: { advisorId } });
        const trust = await prisma.advisorTrustScore.findUnique({ where: { advisorId } });

        console.log('📈 Advisor Performance (Win Rate):', performance?.winRate, '%');
        console.log('⭐ Advisor Trust Score (Overall):', trust?.overallScore);

        if (performance && performance.totalTrades > 0 && trust) {
            console.log('--- E2E SIMULATION SUCCESSFUL ---');
        } else {
            console.error('❌ Integration check failed: Stats not updated.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ E2E SIMULATION FAILED:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

e2eSimulation();
