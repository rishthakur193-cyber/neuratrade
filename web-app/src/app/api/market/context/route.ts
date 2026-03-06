import { NextResponse } from 'next/server';
import { MarketDataService } from '@/services/market-data.service';
import { StrategyEnvironmentService } from '@/services/strategy-environment.service';

export async function GET() {
    try {
        const snapshot = await MarketDataService.getLatestSnapshot();
        const insights = StrategyEnvironmentService.analyzeEnvironment(snapshot);

        return NextResponse.json({
            success: true,
            data: {
                snapshot,
                insights
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
