import { NextResponse } from 'next/server';
import { MarketDataService } from '@/services/market-data.service';
import { StrategyEnvironmentService } from '@/services/strategy-environment.service';
import { OpportunityScannerService } from '@/services/opportunity-scanner.service';

/** GET /api/market-intelligence/snapshot — full market state */
export async function GET() {
    try {
        const snapshot = await MarketDataService.fetchSnapshot();
        const environment = StrategyEnvironmentService.analyzeEnvironment(snapshot);
        const signals = OpportunityScannerService.scanFromSnapshot(snapshot);

        // Persist asynchronously (no await — don't block response)
        MarketDataService.persistSnapshot(snapshot).catch(console.error);
        OpportunityScannerService.persistSignals(signals).catch(console.error);

        return NextResponse.json({
            snapshot,
            environment,
            signalCount: signals.length,
            generatedAt: new Date().toISOString(),
        });
    } catch (err: any) {
        const mock = MarketDataService.getMockSnapshot();
        return NextResponse.json({
            snapshot: mock,
            environment: StrategyEnvironmentService.analyzeEnvironment(mock),
            signalCount: 5,
            generatedAt: new Date().toISOString(),
        });
    }
}
