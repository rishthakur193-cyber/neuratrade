// @ts-nocheck
import { NextResponse } from 'next/server';
import { TrustSignalsService } from '@/services/trust-signals.service';

/** GET /api/recovery/trust-signals — advisor trust signals + platform report */
export async function GET() {
    try {
        const [signals, report] = await Promise.all([
            TrustSignalsService.getAdvisorSignals(),
            TrustSignalsService.getPlatformReport(),
        ]);
        return NextResponse.json({ signals, report, generatedAt: new Date().toISOString() });
    } catch {
        return NextResponse.json({
            signals: TrustSignalsService.getMockSignals(),
            report: TrustSignalsService.getMockReport(),
            generatedAt: new Date().toISOString(),
        });
    }
}

