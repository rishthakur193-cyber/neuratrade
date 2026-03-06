import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (user.role !== 'ADVISOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Currently leads are matched based on InvestorRiskProfile intersecting with AdvisorStrategyDNA
        // For demonstration of the dashboard layout, we provide algorithmic simulated leads:
        const leads = [
            { id: 'l1', name: 'Amitabh Malhotra', profile: 'Institutional / Family Office', match: 98 },
            { id: 'l2', name: 'Saira Banu', profile: 'Global Tech Exec', match: 94 },
            { id: 'l3', name: 'Vikram Rathore', profile: 'Conservative Alpha', match: 89 }
        ];

        return NextResponse.json({ success: true, leads });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
