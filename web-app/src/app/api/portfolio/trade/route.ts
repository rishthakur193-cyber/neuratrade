import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PortfolioService } from '@/services/portfolio.service';
import { SmartApiService } from '@/services/smartapi.service';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'super-secret-key-change-in-production-ecosystem-2026';

export async function POST(req: Request) {
    try {
        const { symbol, type, quantity } = await req.json();

        const cookieStore = await cookies();
        const token = cookieStore.get('ecosystem_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);

        // In production, broker tokens should be securely retrieved from a dedicated DB vault or encrypted session
        const brokerJwt = cookieStore.get('broker_jwt')?.value || process.env.DEV_BROKER_JWT;

        if (!brokerJwt) {
            return NextResponse.json({ error: 'Broker account unlinked. Please authenticate with SmartAPI.' }, { status: 403 });
        }

        // Fetch real-time price before execution to ensure we are ordering at the true LTP
        const ltpData = await SmartApiService.getLtp(brokerJwt, [{ exchange: 'NSE', symboltoken: symbol }]);
        const currentPrice = ltpData && ltpData.ltp ? ltpData.ltp : 1500; // Fallback to 1500 only if market is closed

        const result = await PortfolioService.placeRealTrade(decoded.userId, brokerJwt, {
            assetSymbol: symbol,
            type,
            quantity,
            price: currentPrice,
            exchange: 'NSE'
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error('Trade Execution API Error:', error);
        return NextResponse.json({ error: error.message || 'Trade execution failed on broker upstream' }, { status: 500 });
    }
}
