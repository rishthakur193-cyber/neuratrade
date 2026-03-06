import { NextResponse } from 'next/server';
import { adminGuard } from '@/lib/auth/admin-guard';
import { AdminAdvisorService } from '@/services/admin-advisor.service';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id') || 'guest'; // Mocked header-based auth

    return adminGuard(userId, async () => {
        try {
            const advisors = await AdminAdvisorService.listAllAdvisors();
            return NextResponse.json({ success: true, data: advisors });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    });
}

export async function PATCH(request: Request) {
    const userId = request.headers.get('x-user-id') || 'guest';
    const body = await request.json();
    const { advisorId, action, price } = body;

    return adminGuard(userId, async () => {
        try {
            if (action === 'APPROVE') {
                const res = await AdminAdvisorService.approveAdvisor(advisorId);
                return NextResponse.json(res);
            }
            if (action === 'SUSPEND') {
                const res = await AdminAdvisorService.suspendAdvisor(advisorId);
                return NextResponse.json(res);
            }
            if (action === 'UPDATE_PRICE') {
                const res = await AdminAdvisorService.updatePricing(advisorId, price);
                return NextResponse.json(res);
            }
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    });
}
