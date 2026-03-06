// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { RecoveryPathService } from '@/services/recovery-path.service';

/** GET /api/recovery/progress?userId=xxx  |  PUT to advance stage */
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId') ?? 'mock-user';
    try {
        const progress = await RecoveryPathService.getProgress(userId);
        return NextResponse.json({ progress });
    } catch {
        return NextResponse.json({ progress: RecoveryPathService.getMockProgress(userId) });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { userId = 'mock-user', action, score } = await req.json();
        if (action === 'advance') {
            const result = await RecoveryPathService.advanceStage(userId);
            return NextResponse.json(result);
        }
        if (action === 'updateLearnScore' && typeof score === 'number') {
            await RecoveryPathService.updateLearnScore(userId, score);
            return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

