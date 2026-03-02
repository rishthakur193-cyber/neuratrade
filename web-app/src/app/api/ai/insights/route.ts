import { NextResponse } from 'next/server';
import { AIService } from '@/services/ai.service';
import { AuthService } from '@/services/auth.service';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized middleware barrier' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user) {
            return NextResponse.json({ error: 'Session Invalid' }, { status: 401 });
        }

        const body = await req.json();
        const { action, payload } = body;

        let result = null;

        if (action === 'PORTFOLIO_RISK') {
            result = await AIService.getPortfolioInsights(payload);
        } else if (action === 'MEETING_SUMMARY') {
            result = await AIService.generateMeetingSummary(payload);
        } else if (action === 'ASSET_ANALYSIS') {
            result = await AIService.analyzeAsset(payload.symbol);
        } else {
            return NextResponse.json({ error: 'Unknown Action Type' }, { status: 400 });
        }

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
