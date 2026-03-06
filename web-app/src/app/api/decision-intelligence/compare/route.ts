// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { AdvisorStrategyService } from '@/services/advisor-strategy.service';
import { PerformanceTrackingService } from '@/services/performance-tracking.service';
import { TrustScoreService } from '@/services/trust-score.service';

export async function POST(req: NextRequest) {
    try {
        const { advisorIds } = await req.json();
        if (!advisorIds || !Array.isArray(advisorIds) || advisorIds.length === 0) {
            return NextResponse.json({ error: 'advisorIds array required' }, { status: 400 });
        }

        const mockDNA = AdvisorStrategyService.getMockDNASet();
        const mockTrust = TrustScoreService.getMockTrustScores();

        const comparison = advisorIds.map(id => {
            const dna = mockDNA.find(d => d.advisorId === id) ?? mockDNA[0];
            const trust = mockTrust.find(t => t.advisorId === id) ?? mockTrust[0];
            const stats = PerformanceTrackingService.getMockStats(id);
            return {
                advisorId: id,
                advisorName: dna.advisorName,
                sebiRegNo: dna.sebiRegNo,
                strategyType: dna.strategyType,
                winRate: stats.winRate,
                avgReturn: stats.avgReturn,
                maxDrawdown: stats.maxDrawdown,
                consistencyScore: stats.consistencyScore,
                trustScore: trust.overallScore,
                badge: trust.badge,
                capitalRange: `₹${(dna.capitalMin / 100000).toFixed(0)}L – ₹${(dna.capitalMax / 100000).toFixed(0)}L`,
                totalTrades: stats.totalTrades,
                profitFactor: stats.profitFactor,
                bestTrade: stats.bestTrade,
                worstTrade: stats.worstTrade,
            };
        });

        return NextResponse.json({ comparison, generatedAt: new Date().toISOString() });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

