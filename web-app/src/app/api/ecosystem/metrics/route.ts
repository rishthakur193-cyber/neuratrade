import { NextResponse } from 'next/server';
import { EcosystemMetricsService } from '@/services/ecosystem-metrics.service';

export async function GET() {
    try {
        const [snapshot, trends] = await Promise.all([
            EcosystemMetricsService.getSnapshot(),
            EcosystemMetricsService.getTrends(),
        ]);
        return NextResponse.json({ snapshot, trends, generatedAt: new Date().toISOString() });
    } catch {
        return NextResponse.json({
            snapshot: EcosystemMetricsService.getMockSnapshot(),
            trends: EcosystemMetricsService.getMockTrends(),
            generatedAt: new Date().toISOString(),
        });
    }
}
