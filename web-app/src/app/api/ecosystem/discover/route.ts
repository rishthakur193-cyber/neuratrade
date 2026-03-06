// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { AdvisorDiscoveryService } from '@/services/advisor-discovery.service';

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId') ?? 'mock-user';
    const strategy = req.nextUrl.searchParams.get('strategy') as any;
    const maxDd = req.nextUrl.searchParams.get('maxDrawdown');
    const minTs = req.nextUrl.searchParams.get('minTrustScore');
    const filter = {
        ...(strategy && { strategyType: strategy }),
        ...(maxDd && { maxDrawdown: parseFloat(maxDd) }),
        ...(minTs && { minTrustScore: parseInt(minTs) }),
    };
    try {
        const [advisors, top] = await Promise.all([
            AdvisorDiscoveryService.discoverAdvisors(userId, filter),
            AdvisorDiscoveryService.getTopRecommended(userId),
        ]);
        return NextResponse.json({ advisors, topPicks: top, discoveredAt: new Date().toISOString() });
    } catch {
        const mock = AdvisorDiscoveryService.getMockList(filter);
        return NextResponse.json({ advisors: mock, topPicks: mock.filter(a => a.isTopPick), discoveredAt: new Date().toISOString() });
    }
}

