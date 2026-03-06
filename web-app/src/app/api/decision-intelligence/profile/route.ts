// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { RiskProfilingService } from '@/services/risk-profiling.service';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req }) as any;
        if (!token?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const profile = await RiskProfilingService.getProfile(token.accessToken);
        if (!profile) {
            return NextResponse.json({ exists: false, profile: RiskProfilingService.getMockProfile() });
        }
        return NextResponse.json({ exists: true, profile });
    } catch {
        return NextResponse.json({ exists: false, profile: RiskProfilingService.getMockProfile() });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req }) as any;
        if (!token?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { capitalRange, maxLossTolerance, investmentHorizon,
            tradingFrequency, experienceLevel, emotionalTolerance, preferredStyle } = body;

        const profile = await RiskProfilingService.saveProfile(token.accessToken, {
            capitalRange, maxLossTolerance: Number(maxLossTolerance),
            investmentHorizon, tradingFrequency, experienceLevel, emotionalTolerance,
            preferredStyle
        });

        return NextResponse.json({ success: true, profile });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

