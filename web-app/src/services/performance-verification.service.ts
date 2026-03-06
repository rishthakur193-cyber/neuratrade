const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface VerifiedTrade {
    id: string;
    advisorId: string;
    symbol: string;
    exchange: string;
    entryPrice: number;
    exitPrice?: number;
    stopLoss?: number;
    target?: number;
    qty: number;
    returnPct?: number;
    holdingDays?: number;
    result?: string;
    verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'MISMATCH';
    brokerSource: 'MANUAL' | 'ZERODHA' | 'ANGELONE' | 'UPSTOX';
    mismatchReason?: string;
    tradedAt: string;
    closedAt?: string;
}

export class PerformanceVerificationService {
    static async getVerifiedProfile(advisorId: string, token: string) {
        const res = await fetch(`${API_URL}/advisor-intelligence/performance/${advisorId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return null;
        return await res.json();
    }

    static async getLeaderboard() {
        const res = await fetch(`${API_URL}/advisor-intelligence/leaderboard`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return await res.json();
    }
}
