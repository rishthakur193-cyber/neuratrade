import { NextResponse } from 'next/server';
import { MarketDataService } from '@/services/market-data.service';

/** GET /api/market-intelligence/sectors — sector performance heatmap data */
export async function GET() {
    try {
        const snapshot = await MarketDataService.fetchSnapshot();
        return NextResponse.json({
            sectors: snapshot.sectors,
            marketCondition: snapshot.marketCondition,
            lastUpdated: snapshot.lastUpdated,
        });
    } catch {
        const mock = MarketDataService.getMockSnapshot();
        return NextResponse.json({ sectors: mock.sectors, marketCondition: mock.marketCondition, lastUpdated: mock.lastUpdated });
    }
}
