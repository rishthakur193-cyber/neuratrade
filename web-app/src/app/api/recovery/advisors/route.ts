import { NextRequest, NextResponse } from 'next/server';
import { AdvisorSafetyFilterService } from '@/services/advisor-safety-filter.service';
import type { RecoveryStage } from '@/services/recovery-path.service';

/** GET /api/recovery/advisors?stage=LEARN|SIMULATE|INVEST */
export async function GET(req: NextRequest) {
    const stage = (req.nextUrl.searchParams.get('stage') ?? 'SIMULATE') as RecoveryStage;
    try {
        const advisors = await AdvisorSafetyFilterService.getSafeAdvisors(stage);
        return NextResponse.json({
            advisors,
            count: advisors.length,
            criteria: AdvisorSafetyFilterService.getSafetyCriteria(),
            stage,
        });
    } catch {
        return NextResponse.json({
            advisors: AdvisorSafetyFilterService.getMockSafeAdvisors(),
            count: 4,
            criteria: AdvisorSafetyFilterService.getSafetyCriteria(),
            stage,
        });
    }
}
