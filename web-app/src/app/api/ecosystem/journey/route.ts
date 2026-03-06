// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { InvestorJourneyService } from '@/services/investor-journey.service';

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId') ?? 'mock-user';
    try {
        const journey = await InvestorJourneyService.getJourney(userId);
        return NextResponse.json({ journey });
    } catch {
        return NextResponse.json({ journey: InvestorJourneyService.getMockJourney(userId) });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId = 'mock-user', action } = await req.json();
        const xpAwarded = await InvestorJourneyService.awardXp(userId, action);
        const journey = await InvestorJourneyService.getJourney(userId);
        return NextResponse.json({ xpAwarded, journey }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

