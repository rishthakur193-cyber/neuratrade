import { NextRequest, NextResponse } from 'next/server';
import { PsychologyAnalysisService } from '@/services/psychology-analysis.service';

/** GET /api/recovery/psychology?userId=xxx  |  POST to submit answers */
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId') ?? 'mock-user';
    try {
        const result = await PsychologyAnalysisService.getLatest(userId);
        return NextResponse.json({ assessment: result ?? PsychologyAnalysisService.getMockAssessment(userId) });
    } catch {
        return NextResponse.json({ assessment: PsychologyAnalysisService.getMockAssessment(userId) });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId = 'mock-user', ...answers } = body;
        const result = PsychologyAnalysisService.analyze(userId, answers);
        await PsychologyAnalysisService.saveAssessment(result);
        return NextResponse.json({ assessment: result }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
