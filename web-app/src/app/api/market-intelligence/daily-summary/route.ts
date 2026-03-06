import { NextResponse } from 'next/server';
import { MarketDataService } from '@/services/market-data.service';
import { AdvisorCorrelationService } from '@/services/advisor-correlation.service';
import { OpportunityScannerService } from '@/services/opportunity-scanner.service';
import { DailySummaryService } from '@/services/daily-summary.service';

/** GET /api/market-intelligence/daily-summary — AI-generated daily briefing */
export async function GET() {
    try {
        const [snapshot, signals] = await Promise.all([
            MarketDataService.fetchSnapshot(),
            OpportunityScannerService.getActiveSignals(),
        ]);
        const rankings = await AdvisorCorrelationService.getCurrentRankings(snapshot.marketCondition);
        const summary = await DailySummaryService.generate(snapshot, rankings, signals);
        return NextResponse.json({ summary, generatedAt: new Date().toISOString() });
    } catch {
        const mock = MarketDataService.getMockSnapshot();
        const mockRankings = AdvisorCorrelationService.getMockRankings(mock.marketCondition);
        const mockSignals = OpportunityScannerService.getMockOpportunities();
        const summary = await DailySummaryService.generate(mock, mockRankings, mockSignals);
        return NextResponse.json({ summary, generatedAt: new Date().toISOString() });
    }
}
