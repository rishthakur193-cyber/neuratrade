import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analytics.service';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user) {
            return NextResponse.json({ error: 'Session Invalid' }, { status: 401 });
        }

        const riskMetrics = await AnalyticsService.getPortfolioRisk(user.id);

        return NextResponse.json({ risk: riskMetrics }, { status: 200 });

    } catch (error: any) {
        console.error('Analytics Risk Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
