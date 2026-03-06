import { NextRequest, NextResponse } from 'next/server';
import { RecoveryIntakeService } from '@/services/recovery-intake.service';

/** GET /api/recovery/intake?userId=xxx  |  POST to create profile */
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId') ?? 'mock-user';
    try {
        const profile = await RecoveryIntakeService.getProfile(userId);
        return NextResponse.json({ profile: profile ?? RecoveryIntakeService.getMockProfile(userId) });
    } catch {
        return NextResponse.json({ profile: RecoveryIntakeService.getMockProfile(userId) });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId = 'mock-user', ...input } = body;
        const profile = await RecoveryIntakeService.createProfile(userId, input);
        return NextResponse.json({ profile }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
