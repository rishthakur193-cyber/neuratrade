import { NextRequest, NextResponse } from 'next/server';
import { ReferralService } from '@/services/referral.service';

export async function GET(req: NextRequest) {
    const ownerId = req.nextUrl.searchParams.get('userId') ?? 'mock-user';
    const ownerType = (req.nextUrl.searchParams.get('type') ?? 'INVESTOR') as 'INVESTOR' | 'ADVISOR';
    try {
        const [info, stats] = await Promise.all([
            ReferralService.getOrCreate(ownerId, ownerType),
            ReferralService.getNetworkStats(),
        ]);
        return NextResponse.json({ referral: info, network: stats });
    } catch {
        return NextResponse.json({
            referral: ReferralService.getMockReferral(ownerId, ownerType),
            network: ReferralService.getMockNetworkStats(),
        });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { code, newUserId } = await req.json();
        const result = await ReferralService.redeem(code, newUserId ?? 'mock-user');
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
