const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ScoringMetrics {
    consistency: number;
    riskManagement: number;
    clientFeedback: number;
    transparency: number;
}

export interface CompatibilityMetrics {
    riskScore: number;
    strategyScore: number;
    capitalScore: number;
    consistencyScore: number;
}

export class ScoringEngineService {
    static async calculateTrustScore(token: string, metrics: ScoringMetrics): Promise<number> {
        const response = await fetch(`${BASE_URL}/scoring/trust`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metrics),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to calculate trust score');
        return result.trustScore;
    }

    static async calculateCompatibilityScore(token: string, metrics: CompatibilityMetrics): Promise<number> {
        const response = await fetch(`${BASE_URL}/scoring/compatibility`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metrics),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to calculate compatibility score');
        return result.compatibilityScore;
    }
}
