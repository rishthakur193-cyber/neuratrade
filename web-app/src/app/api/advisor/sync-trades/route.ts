import { NextRequest, NextResponse } from 'next/server';
import { VerifiedPerformanceService } from '@/services/verified-performance.service';

/**
 * POST /api/advisor/sync-trades
 * Body: { advisorId }
 * Protected route — triggers a fresh trade book sync from Angel One.
 * Called manually by advisor or via cron.
 */
export async function POST(req: NextRequest) {
    try {
        const { advisorId } = await req.json();
        if (!advisorId) {
            return NextResponse.json({ error: 'advisorId required' }, { status: 400 });
        }

        const result = await VerifiedPerformanceService.syncAdvisorTrades(advisorId);
        const badge = await VerifiedPerformanceService.getVerifiedProfile(advisorId);

        return NextResponse.json({
            success: true,
            ...result,
            newBadgeLevel: badge?.badgeLevel ?? 'UNVERIFIED',
            verificationPct: badge?.verificationPct ?? 0,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
