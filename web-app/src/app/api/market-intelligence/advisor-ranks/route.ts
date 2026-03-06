import { NextResponse } from 'next/server';
import { MarketDataService } from '@/services/market-data.service';
import { AdvisorCorrelationService } from '@/services/advisor-correlation.service';

/** GET /api/market-intelligence/advisor-ranks — current advantage rankings */
export async function GET() {
    try {
        const snapshot = await MarketDataService.fetchSnapshot();
        const rankings = await AdvisorCorrelationService.getCurrentRankings(snapshot.marketCondition);
        return NextResponse.json({
            marketCondition: snapshot.marketCondition,
            rankings,
            generatedAt: new Date().toISOString(),
        });
    } catch {
        const mock = MarketDataService.getMockSnapshot();
        return NextResponse.json({
            marketCondition: mock.marketCondition,
            rankings: AdvisorCorrelationService.getMockRankings(mock.marketCondition),
            generatedAt: new Date().toISOString(),
        });
    }
}
