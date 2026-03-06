const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type FlagSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type FlagType =
    | 'UNREALISTIC_RETURNS'
    | 'MISSING_STOP_LOSS'
    | 'EXTREME_LEVERAGE'
    | 'STRATEGY_INCONSISTENCY'
    | 'CHERRY_PICKING'
    | 'SEBI_UNVERIFIED';

export interface ScamFlag {
    id: string;
    advisorId: string;
    advisorName?: string;
    flagType: FlagType;
    severity: FlagSeverity;
    description: string;
    detectedAt: string;
}

export class ScamDetectionService {
    static async getAdvisorFlags(advisorId: string): Promise<ScamFlag[]> {
        const res = await fetch(`${API_URL}/ecosystem/scam-flags/${advisorId}`);
        if (!res.ok) return [];
        return await res.json();
    }

    static async scanAdvisor(advisorId: string): Promise<ScamFlag[]> {
        // Server handles scanning logic, we just fetch results
        return this.getAdvisorFlags(advisorId);
    }
}
