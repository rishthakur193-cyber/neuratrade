import { NextRequest, NextResponse } from 'next/server';
import { RecoveryMetricsService } from '@/services/recovery-metrics.service';

/** GET /api/recovery/metrics?userId=xxx  |  POST to record a month */
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId') ?? 'mock-user';
    try {
        const summary = await RecoveryMetricsService.getSummary(userId);
        return NextResponse.json({ summary });
    } catch {
        return NextResponse.json({ summary: RecoveryMetricsService.getMockSummary(userId) });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId = 'mock-user', ...data } = await req.json();
        await RecoveryMetricsService.recordMonthly(userId, data);
        const summary = await RecoveryMetricsService.getSummary(userId);
        return NextResponse.json({ summary }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
