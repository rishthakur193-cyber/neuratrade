import { NextRequest, NextResponse } from 'next/server';
import { CompatibilityService } from '@/services/compatibility.service';
import { RiskProfilingService } from '@/services/risk-profiling.service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, profileOverride } = body;

        // Use provided profile override or fetch from DB; fall back to mock
        let investor = profileOverride ?? null;
        if (!investor && userId) {
            const dbProfile = await RiskProfilingService.getProfile(userId);
            investor = dbProfile ?? RiskProfilingService.getMockProfile();
        }
        if (!investor) investor = RiskProfilingService.getMockProfile();

        const matches = await CompatibilityService.getMatches(investor, 3, !userId);

        return NextResponse.json({
            investorProfile: investor,
            matches,
            generatedAt: new Date().toISOString(),
        });
    } catch (err: any) {
        // Graceful fallback with mock data
        const investor = RiskProfilingService.getMockProfile();
        const matches = await CompatibilityService.getMatches(investor, 3, true).catch(() => []);
        return NextResponse.json({ investorProfile: investor, matches, error: err.message });
    }
}
