const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface StrategyDNA {
    advisorId: string;
    advisorName: string;
    sebiRegNo: string;
    strategyType: string;
    avgHoldingDays: number;
    avgRiskPerTrade: number;
    historicalMaxDrawdown: number;
    avgReturnPerTrade: number;
    winRate: number;
    consistencyScore: number;
    capitalMin: number;
    capitalMax: number;
    totalTrades: number;
}

export class AdvisorStrategyService {
    static async getDNA(advisorId: string): Promise<StrategyDNA | null> {
        const res = await fetch(`${API_URL}/advisor-intelligence/strategy-dna/${advisorId}`);
        if (!res.ok) return null;
        return await res.json();
    }
}
