import { NextRequest, NextResponse } from 'next/server';
import { ReputationLedgerService } from '@/services/reputation-ledger.service';

export async function GET(req: NextRequest) {
    const advisorId = req.nextUrl.searchParams.get('advisorId') ?? 'eco-adv-1';
    try {
        const summary = await ReputationLedgerService.getLedger(advisorId);
        return NextResponse.json({ summary, generatedAt: new Date().toISOString() });
    } catch {
        return NextResponse.json({ summary: ReputationLedgerService.getMockSummary(advisorId), generatedAt: new Date().toISOString() });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { advisorId, ...data } = await req.json();
        const entry = await ReputationLedgerService.appendEntry(advisorId, data);
        return NextResponse.json({ entry }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
