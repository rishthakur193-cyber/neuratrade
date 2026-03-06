import prisma from '../lib/prisma.js';
export class PerformanceAnalyticsService {
    static async recalculateAndStore(advisorId) {
        // Fetch all closed signals for this advisor
        const closedSignals = await prisma.advisorRecommendation.findMany({
            where: {
                advisorId: advisorId,
                isActiveSignal: false,
                returnPct: { not: null }
            },
            orderBy: { closedAt: 'asc' }
        });
        if (closedSignals.length === 0)
            return;
        const totalTrades = closedSignals.length;
        let winningTrades = 0;
        let losingTrades = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        let runningEquity = 100000; // Base index for curve
        let peakEquity = runningEquity;
        let maxDrawdown = 0;
        const equityCurve = [];
        equityCurve.push({ date: new Date().toISOString(), balance: runningEquity }); // Starting point
        for (const signal of closedSignals) {
            const pct = signal.returnPct || 0;
            if (pct > 0) {
                winningTrades++;
                grossProfit += pct;
            }
            else if (pct < 0) {
                losingTrades++;
                grossLoss += Math.abs(pct);
            }
            // Simulate compounding effect on index, using returnPct directly as 1:1 unleveraged
            runningEquity = runningEquity * (1 + (pct / 100));
            equityCurve.push({ date: (signal.closedAt || new Date()).toISOString(), balance: runningEquity });
            if (runningEquity > peakEquity) {
                peakEquity = runningEquity;
            }
            const currentDrawdown = (peakEquity - runningEquity) / peakEquity * 100;
            if (currentDrawdown > maxDrawdown) {
                maxDrawdown = currentDrawdown;
            }
        }
        const winRate = (winningTrades / totalTrades) * 100;
        const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss);
        // Sum returns simply to average
        const totalReturn = closedSignals.reduce((acc, sig) => acc + (sig.returnPct || 0), 0);
        const avgReturnPerTrade = totalReturn / totalTrades;
        // Upsert AdvisorPerformance
        await prisma.advisorPerformance.upsert({
            where: { advisorId },
            update: {
                winRate,
                totalTrades,
                winningTrades,
                losingTrades,
                profitFactor,
                maxDrawdown,
                avgReturnPerTrade,
                equityCurve: JSON.stringify(equityCurve)
            },
            create: {
                advisorId,
                winRate,
                totalTrades,
                winningTrades,
                losingTrades,
                profitFactor,
                maxDrawdown,
                avgReturnPerTrade,
                equityCurve: JSON.stringify(equityCurve)
            }
        });
        console.log(`[PerformanceAnalyticsService] Updated stats for Advisor ${advisorId}. WinRate: ${winRate.toFixed(2)}%, PF: ${profitFactor.toFixed(2)}`);
    }
}
