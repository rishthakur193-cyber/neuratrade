import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (userRole !== 'ADVISOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const db = await initDb();
        const profile = await db.get('SELECT id FROM AdvisorProfile WHERE userId = ?', [userId]);

        let strategies = [];
        if (profile) {
            strategies = await db.all('SELECT * FROM AdvisorStrategyDNA WHERE advisorId = ?', [profile.id]);
            // If empty, provide a mock set for demonstration of the dashboard functionality
            if (strategies.length === 0) {
                strategies = [
                    { id: '1', strategyType: 'Quant-Alpha Institutional', capitalMin: 420000000, avgReturnPerTrade: 24.2, avgRiskPerTrade: 'MOD' },
                    { id: '2', strategyType: 'Global Tech Composite', capitalMin: 280000000, avgReturnPerTrade: 18.5, avgRiskPerTrade: 'HIGH' },
                    { id: '3', strategyType: 'Yield Guard Bonds', capitalMin: 150000000, avgReturnPerTrade: 9.2, avgRiskPerTrade: 'LOW' }
                ];
            }
        }

        return NextResponse.json({ success: true, strategies });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
