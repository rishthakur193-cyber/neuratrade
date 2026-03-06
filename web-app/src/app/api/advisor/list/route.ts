import { NextResponse } from 'next/server';
import { AdvisorListingService } from '@/services/advisor-listing.service';

export async function GET() {
    try {
        const advisors = await AdvisorListingService.getPublicList();
        return NextResponse.json({
            success: true,
            data: advisors,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
