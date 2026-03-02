import { NextResponse } from 'next/server';
import { MatchingService } from '@/services/matching.service';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user || user.role !== 'INVESTOR') {
            return NextResponse.json({ error: 'Investor Privileges Required' }, { status: 403 });
        }

        const matches = await MatchingService.getMatches(user.id);
        return NextResponse.json({ matches }, { status: 200 });

    } catch (error: any) {
        console.error('Matching Engine Fetch Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
