// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { TrustScoreService } from '@/services/trust-score.service';
import { ScamDetectionService } from '@/services/scam-detection.service';

export async function GET() {
    try {
        // Return trust scores + scam flags for all mock advisors
        const trustScores = TrustScoreService.getMockTrustScores();
        const flags = ScamDetectionService.getMockFlags();

        return NextResponse.json({ trustScores, flags, generatedAt: new Date().toISOString() });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

