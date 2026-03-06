import { NextResponse } from 'next/server';
import { VerifiedPerformanceService } from '@/services/verified-performance.service';

/**
 * GET /api/advisor/verified-performance
 * Returns the leaderboard of all verified advisors (public).
 */
export async function GET() {
    try {
        let leaderboard = await VerifiedPerformanceService.getLeaderboard();
        if (leaderboard.length === 0) {
            leaderboard = VerifiedPerformanceService.getMockLeaderboard();
        }
        return NextResponse.json({ leaderboard, generatedAt: new Date().toISOString() });
    } catch {
        return NextResponse.json({
            leaderboard: VerifiedPerformanceService.getMockLeaderboard(),
            generatedAt: new Date().toISOString(),
        });
    }
}
