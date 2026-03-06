import { NextRequest, NextResponse } from 'next/server';
import { BrokerRegistryService } from '@/services/broker-integration/broker-registry.service';
import type { BrokerName } from '@/services/broker-integration/broker.interface';

/** POST /api/broker-integration/connect
 * Body: { broker, clientId, apiKey, apiSecret, mpin, totp, requestToken }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { broker, ...credentials } = body;
        if (!broker) return NextResponse.json({ error: 'broker is required' }, { status: 400 });
        const session = await BrokerRegistryService.connect(broker as BrokerName, credentials);
        return NextResponse.json({ session }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
