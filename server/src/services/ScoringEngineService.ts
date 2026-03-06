import { TRUST_SCORE_WEIGHTS, COMPATIBILITY_WEIGHTS, RISK_ALIGNMENT_WEIGHTS } from '../config/scoring.config.js';

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
    static calculateTrustScore(metrics: ScoringMetrics): number {
        const { consistency, riskManagement, clientFeedback, transparency } = metrics;
        const score = (
            consistency * TRUST_SCORE_WEIGHTS.CONSISTENCY +
            riskManagement * TRUST_SCORE_WEIGHTS.RISK_MANAGEMENT +
            clientFeedback * TRUST_SCORE_WEIGHTS.CLIENT_FEEDBACK +
            transparency * TRUST_SCORE_WEIGHTS.TRANSPARENCY
        );
        return Math.round(score * 10) / 10;
    }

    static calculateCompatibilityScore(metrics: CompatibilityMetrics): number {
        const { riskScore, strategyScore, capitalScore, consistencyScore } = metrics;
        const score = (
            riskScore * COMPATIBILITY_WEIGHTS.RISK +
            strategyScore * COMPATIBILITY_WEIGHTS.STRATEGY +
            capitalScore * COMPATIBILITY_WEIGHTS.CAPITAL +
            consistencyScore * COMPATIBILITY_WEIGHTS.CONSISTENCY
        );
        return Math.round(score);
    }

    static calculateRiskAlignmentScore(allocation: number, volatility: number, diversification: number): number {
        const score = (
            allocation * RISK_ALIGNMENT_WEIGHTS.ASSET_ALLOCATION +
            volatility * RISK_ALIGNMENT_WEIGHTS.VOLATILITY_FIT +
            diversification * RISK_ALIGNMENT_WEIGHTS.DIVERSIFICATION
        );
        return Math.round(score);
    }
}
