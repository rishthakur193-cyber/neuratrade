import { NextRequest, NextResponse } from 'next/server';
import { RiskSimulationService } from '@/services/risk-simulation.service';

export async function POST(req: NextRequest) {
    try {
        const { advisorId, principal } = await req.json();
        if (!advisorId || !principal) {
            return NextResponse.json({ error: 'advisorId and principal are required' }, { status: 400 });
        }

        const result = await RiskSimulationService.simulate(
            advisorId,
            Number(principal),
            true // use mock data (set false when real trade history exists)
        );

        return NextResponse.json({ success: true, simulation: result });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
