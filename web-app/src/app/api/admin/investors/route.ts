import { NextResponse } from 'next/server';
import { adminGuard } from '@/lib/auth/admin-guard';
import { AdminInvestorService } from '@/services/admin-investor.service';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id') || 'guest';

    return adminGuard(userId, async () => {
        try {
            const investors = await AdminInvestorService.listAllInvestors();
            return NextResponse.json({ success: true, data: investors });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    });
}

export async function PATCH(request: Request) {
    const userId = request.headers.get('x-user-id') || 'guest';
    const body = await request.json();
    const { subscriptionId, status } = body;

    return adminGuard(userId, async () => {
        try {
            const res = await AdminInvestorService.toggleSubscription(subscriptionId, status);
            return NextResponse.json(res);
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    });
}
