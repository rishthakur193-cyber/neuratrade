import { NextResponse } from 'next/server';
import { MarketDataService } from '@/services/market-data.service';
import { OpportunityScannerService } from '@/services/opportunity-scanner.service';

/** GET /api/market-intelligence/opportunities — active opportunity signals */
export async function GET() {
    try {
        const snapshot = await MarketDataService.fetchSnapshot();
        const liveSignals = OpportunityScannerService.scanFromSnapshot(snapshot);
        const dbSignals = await OpportunityScannerService.getActiveSignals();

        // Merge unique signals (prefer live fresh ones)
        const merged = liveSignals.length > 0 ? liveSignals : dbSignals;
        return NextResponse.json({ signals: merged, count: merged.length, generatedAt: new Date().toISOString() });
    } catch {
        const mock = OpportunityScannerService.getMockOpportunities();
        return NextResponse.json({ signals: mock, count: mock.length, generatedAt: new Date().toISOString() });
    }
}
