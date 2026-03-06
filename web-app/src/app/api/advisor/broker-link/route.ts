import { NextRequest, NextResponse } from 'next/server';
import { VerifiedPerformanceService } from '@/services/verified-performance.service';

/**
 * POST /api/advisor/broker-link
 * Body: { advisorId, clientCode, mpin, totp }
 * Links an advisor's Angel One account and triggers first trade sync.
 * Returns success + first badge level.
 *
 * DELETE /api/advisor/broker-link
 * Body: { advisorId }
 * Deactivates the broker link.
 */
export async function POST(req: NextRequest) {
    try {
        const { advisorId, clientCode, mpin, totp } = await req.json();

        if (!advisorId || !clientCode || !mpin || !totp) {
            return NextResponse.json(
                { error: 'advisorId, clientCode, mpin, and totp are all required' },
                { status: 400 }
            );
        }

        const result = await VerifiedPerformanceService.linkBroker(
            advisorId, clientCode, mpin, totp
        );

        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { advisorId } = await req.json();
        if (!advisorId) {
            return NextResponse.json({ error: 'advisorId required' }, { status: 400 });
        }
        await VerifiedPerformanceService.unlinkBroker(advisorId);
        return NextResponse.json({ success: true, message: 'Broker unlinked successfully' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
