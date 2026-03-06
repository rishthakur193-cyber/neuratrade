import { NextResponse } from 'next/server';
import { AdminService } from '@/services/admin.service';
import { AuthService } from '@/services/auth.service';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized middleware barrier' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Strictly Admin Privileges Required' }, { status: 403 });
        }

        const body = await req.json();
        const { advisorProfileId } = body;

        if (!advisorProfileId) {
            return NextResponse.json({ error: 'Advisor Profile ID required' }, { status: 400 });
        }

        const result = await AdminService.verifyAdvisor(user.id, advisorProfileId);

        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
