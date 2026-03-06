const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface RiskQuestionnaireInput {
    capitalRange: string;
    maxLossTolerance: number;
    investmentHorizon: string;
    tradingFrequency: string;
    experienceLevel: string;
    emotionalTolerance: string;
    preferredStyle?: 'MANUAL' | 'ALGO' | 'HYBRID';
}

export interface InvestorProfile {
    investorType: string;
    riskCategory: 'Conservative' | 'Moderate' | 'Aggressive';
    capitalRange: string;
    maxDrawdownTolerance: string;
    preferredStrategy: string;
    preferredStyle: string;
    riskScore: number;
}

export class RiskProfilingService {
    /** Save a new / updated risk profile for an investor */
    static async saveProfile(token: string, input: RiskQuestionnaireInput): Promise<InvestorProfile> {
        const response = await fetch(`${BASE_URL}/risk-profiling`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to save risk profile');
        return result;
    }

    /** Fetch existing profile for a user */
    static async getProfile(token: string): Promise<InvestorProfile | null> {
        const response = await fetch(`${BASE_URL}/risk-profiling`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 404) return null;
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch risk profile');
        return result;
    }

    /** Generate a mock profile (preserved for legacy UI) */
    static getMockProfile(): InvestorProfile {
        return {
            investorType: 'Moderate Swing Investor',
            riskCategory: 'Moderate',
            capitalRange: '3L-10L',
            maxDrawdownTolerance: '12%',
            preferredStrategy: 'Swing / Positional',
            preferredStyle: 'MANUAL',
            riskScore: 52,
        };
    }
}
