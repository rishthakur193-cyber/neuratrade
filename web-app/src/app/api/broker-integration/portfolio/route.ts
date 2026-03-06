import { NextRequest, NextResponse } from 'next/server';
import { BrokerRegistryService } from '@/services/broker-integration/broker-registry.service';
import type { BrokerName } from '@/services/broker-integration/broker.interface';

/** GET /api/broker-integration/portfolio?broker=ZERODHA&accessToken=xxx&clientId=xxx */
export async function GET(req: NextRequest) {
    const broker = req.nextUrl.searchParams.get('broker') as BrokerName | null;
    const accessToken = req.nextUrl.searchParams.get('accessToken') ?? 'MOCK';
    const clientId = req.nextUrl.searchParams.get('clientId') ?? 'demo-user';
    if (!broker) return NextResponse.json({ error: 'broker param required' }, { status: 400 });
    try {
        const portfolio = await BrokerRegistryService.getPortfolio(broker, accessToken, clientId);
        const health = BrokerRegistryService.computePortfolioHealth(portfolio);
        return NextResponse.json({ portfolio, health, generatedAt: new Date().toISOString() });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
