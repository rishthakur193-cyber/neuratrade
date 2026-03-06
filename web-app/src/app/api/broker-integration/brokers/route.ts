import { NextResponse } from 'next/server';
import { BrokerRegistryService } from '@/services/broker-integration/broker-registry.service';

/** GET /api/broker-integration/brokers — list all registered brokers */
export async function GET() {
    try {
        const brokers = BrokerRegistryService.getAllBrokers();
        return NextResponse.json({ brokers, count: brokers.length });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
