// @ts-nocheck
import { NextResponse } from 'next/server';
import { StrategyIntelligenceService } from '@/services/strategy-intelligence.service';

export async function GET() {
    try {
        const intel = await StrategyIntelligenceService.getIntelligence();
        return NextResponse.json(intel);
    } catch {
        return NextResponse.json({
            rankings: StrategyIntelligenceService.getMockRankings(),
            momentumAdvisors: StrategyIntelligenceService.MOCK_MOMENTUM_ADVISORS,
            underperformers: StrategyIntelligenceService.getMockRankings().filter(r => r.score < 50),
            marketCondition: 'HIGH_VOLATILITY', generatedAt: new Date().toISOString(),
        });
    }
}

