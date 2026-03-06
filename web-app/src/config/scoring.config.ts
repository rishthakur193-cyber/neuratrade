/**
 * Centralized Scoring Configuration Registry
 * 
 * This file contains all the weights and constants used across the 
 * platform's various scoring engines (Trust, Compatibility, Risk).
 */

export const TRUST_SCORE_WEIGHTS = {
    CONSISTENCY: 0.30,
    RISK_MANAGEMENT: 0.25,
    CLIENT_FEEDBACK: 0.25,
    TRANSPARENCY: 0.20,
};

export const COMPATIBILITY_WEIGHTS = {
    RISK: 0.40,
    STRATEGY: 0.30,
    CAPITAL: 0.15,
    CONSISTENCY: 0.15,
};

export const RISK_ALIGNMENT_WEIGHTS = {
    ASSET_ALLOCATION: 0.40,
    VOLATILITY_FIT: 0.30,
    DIVERSIFICATION: 0.30,
};

export const SCORING_THRESHOLDS = {
    PLATINUM: 9.0,
    GOLD: 7.5,
    SILVER: 6.0,
    TOP_PICK: 80, // for 0-100 scales
};
