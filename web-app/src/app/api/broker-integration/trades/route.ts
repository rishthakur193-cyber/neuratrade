import { NextRequest, NextResponse } from 'next/server';
import { BrokerRegistryService } from '@/services/broker-integration/broker-registry.service';
import type { BrokerName } from '@/services/broker-integration/broker.interface';

/** GET /api/broker-integration/trades?broker=ZERODHA&accessToken=xxx&clientId=xxx&days=90 */
export async function GET(req: NextRequest) {
    const broker = req.nextUrl.searchParams.get('broker') as BrokerName | null;
    const accessToken = req.nextUrl.searchParams.get('accessToken') ?? 'MOCK';
    const clientId = req.nextUrl.searchParams.get('clientId') ?? 'demo-user';
    const days = parseInt(req.nextUrl.searchParams.get('days') ?? '90');
    const verifyMode = req.nextUrl.searchParams.get('verify') === 'true';
    if (!broker) return NextResponse.json({ error: 'broker param required' }, { status: 400 });
    try {
        if (verifyMode) {
            const verification = await BrokerRegistryService.verifyAdvisorPerformance(broker, clientId, accessToken);
            return NextResponse.json({ verification });
        }
        const trades = await BrokerRegistryService.getTradeHistory(broker, accessToken, clientId, days);
        return NextResponse.json({ trades });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
