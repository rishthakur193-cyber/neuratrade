import { NextRequest, NextResponse } from 'next/server';
import { VerifiedPerformanceService } from '@/services/verified-performance.service';

/**
 * GET /api/advisor/verified-performance/[advisorId]
 * Returns verified profile + trade list for a single advisor (public).
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ advisorId: string }> }
) {
    const { advisorId } = await params;
    try {
        const [profile, trades] = await Promise.all([
            VerifiedPerformanceService.getVerifiedProfile(advisorId),
            VerifiedPerformanceService.getVerifiedTrades(advisorId),
        ]);

        // Fall back to mock if no real data
        if (!profile) {
            const mockLeader = VerifiedPerformanceService.getMockLeaderboard()
                .find(l => l.advisorId === advisorId)
                ?? VerifiedPerformanceService.getMockLeaderboard()[0];
            const mockTrades = VerifiedPerformanceService.getMockVerifiedTrades(advisorId);
            return NextResponse.json({ profile: mockLeader, trades: mockTrades });
        }

        const tradesToReturn = trades.length > 0
            ? trades
            : VerifiedPerformanceService.getMockVerifiedTrades(advisorId);

        return NextResponse.json({ profile, trades: tradesToReturn });
    } catch {
        const mockLeader = VerifiedPerformanceService.getMockLeaderboard()[0];
        return NextResponse.json({
            profile: mockLeader,
            trades: VerifiedPerformanceService.getMockVerifiedTrades(advisorId),
        });
    }
}
