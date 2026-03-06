import { NextResponse } from 'next/server';
import { AdvisorService } from '@/services/advisor.service';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized middleware barrier' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user || user.role !== 'ADVISOR') {
            return NextResponse.json({ error: 'Advisor Privileges Required' }, { status: 403 });
        }

        const clients = await AdvisorService.getClients(token);

        return NextResponse.json(clients, { status: 200 });

    } catch (error: any) {
        console.error('Advisor Client Fetch Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
