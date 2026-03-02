import { NextResponse } from 'next/server';
import { PortfolioService } from '@/services/portfolio.service';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');

        // Fast Bearer token guard
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized middleware barrier' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user) {
            return NextResponse.json({ error: 'Session Invalid' }, { status: 401 });
        }

        const overview = await PortfolioService.getOverview(user.id);

        return NextResponse.json(overview, { status: 200 });

    } catch (error: any) {
        console.error('Portfolio Fetch Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
