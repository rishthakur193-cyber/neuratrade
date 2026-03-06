/**
 * Advisor Discovery Service — Ecosystem Growth Engine Module 1
 *
 * Discovers and ranks advisors for an investor based on:
 *   - Compatibility score (existing compatibility.service)
 *   - Trust score (existing trust-score tables)
 *   - Current market advantage (existing strategy-environment)
 *   - Performance consistency
 *
 * ADDITIVE: does not modify any existing service.
 */

import { initDb } from '@/lib/db';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type StrategyType = 'INTRADAY' | 'SWING' | 'POSITIONAL' | 'OPTIONS' | 'MOMENTUM' | 'SCALPING';

export interface DiscoveredAdvisor {
    advisorId: string;
    name: string;
    sebiRegNo: string;
    strategyType: StrategyType;
    compatibilityScore: number;   // 0–100: how well they match the investor
    trustScore: number;           // 0–100: platform trust rating
    marketFitScore: number;       // 0–100: current market condition alignment
    compositeScore: number;       // weighted average
    verificationBadge: string;
    winRate: number;
    maxDrawdown: number;
    avgMonthlyReturn: number;
    matchReasons: string[];
    isTopPick: boolean;
}

export interface DiscoveryFilter {
    strategyType?: StrategyType;
    maxDrawdown?: number;
    minTrustScore?: number;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

const MARKET_FIT: Record<StrategyType, number> = {
    INTRADAY: 85, OPTIONS: 78, SWING: 65, POSITIONAL: 50, MOMENTUM: 55, SCALPING: 70,
};

function composite(c: number, t: number, m: number): number {
    return Math.round(c * 0.35 + t * 0.40 + m * 0.25);
}

function buildReasons(a: DiscoveredAdvisor): string[] {
    const r: string[] = [];
    if (a.trustScore >= 85) r.push('Highly trusted by the platform');
    if (a.compatibilityScore >= 75) r.push('Excellent match for your risk profile');
    if (a.winRate >= 70) r.push(`${a.winRate}% verified win rate`);
    if (a.maxDrawdown < 10) r.push('Low drawdown — good capital protection');
    if (a.marketFitScore >= 75) r.push('Strategy excels in current market conditions');
    if (r.length === 0) r.push('Solid verified record');
    return r;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ADVISORS: Omit<DiscoveredAdvisor, 'compositeScore' | 'matchReasons' | 'isTopPick'>[] = [
    { advisorId: 'eco-adv-1', name: 'Sunita Patel CFA', sebiRegNo: 'INA000045678', strategyType: 'INTRADAY', compatibilityScore: 91, trustScore: 94, marketFitScore: 85, verificationBadge: 'PLATINUM', winRate: 74, maxDrawdown: 6.2, avgMonthlyReturn: 2.1 },
    { advisorId: 'eco-adv-2', name: 'Arvind Mehta CFA', sebiRegNo: 'INA000012345', strategyType: 'POSITIONAL', compatibilityScore: 78, trustScore: 88, marketFitScore: 50, verificationBadge: 'GOLD', winRate: 72, maxDrawdown: 9.4, avgMonthlyReturn: 3.1 },
    { advisorId: 'eco-adv-3', name: 'Priya Sharma', sebiRegNo: 'INA000034567', strategyType: 'SWING', compatibilityScore: 85, trustScore: 82, marketFitScore: 65, verificationBadge: 'GOLD', winRate: 68, maxDrawdown: 11.1, avgMonthlyReturn: 2.8 },
    { advisorId: 'eco-adv-4', name: 'Rajesh Kumar', sebiRegNo: 'INA000078901', strategyType: 'OPTIONS', compatibilityScore: 72, trustScore: 85, marketFitScore: 78, verificationBadge: 'GOLD', winRate: 70, maxDrawdown: 8.3, avgMonthlyReturn: 3.6 },
    { advisorId: 'eco-adv-5', name: 'Meera Iyer', sebiRegNo: 'INA000067890', strategyType: 'POSITIONAL', compatibilityScore: 69, trustScore: 81, marketFitScore: 50, verificationBadge: 'GOLD', winRate: 65, maxDrawdown: 11.8, avgMonthlyReturn: 2.4 },
    { advisorId: 'eco-adv-6', name: 'Sanjay Verma', sebiRegNo: 'INA000023456', strategyType: 'MOMENTUM', compatibilityScore: 74, trustScore: 77, marketFitScore: 55, verificationBadge: 'SILVER', winRate: 62, maxDrawdown: 13.2, avgMonthlyReturn: 2.2 },
];

function buildMockList(filter?: DiscoveryFilter): DiscoveredAdvisor[] {
    let list = MOCK_ADVISORS;
    if (filter?.strategyType) list = list.filter(a => a.strategyType === filter.strategyType);
    if (filter?.maxDrawdown) list = list.filter(a => a.maxDrawdown <= filter.maxDrawdown!);
    if (filter?.minTrustScore) list = list.filter(a => a.trustScore >= filter.minTrustScore!);

    const scored = list.map(a => {
        const comp = composite(a.compatibilityScore, a.trustScore, a.marketFitScore);
        const reasons = buildReasons({ ...a, compositeScore: comp, matchReasons: [], isTopPick: false });
        return { ...a, compositeScore: comp, matchReasons: reasons, isTopPick: comp >= 80 };
    });
    return scored.sort((a, b) => b.compositeScore - a.compositeScore);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AdvisorDiscoveryService {

    static async discoverAdvisors(token: string): Promise<DiscoveredAdvisor[]> {
        const res = await fetch(`${API_URL}/advisor-intelligence/discovery`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to discover advisors');
        return await res.json();
    }

    static async getTopRecommended(token: string): Promise<DiscoveredAdvisor[]> {
        const all = await AdvisorDiscoveryService.discoverAdvisors(token);
        return all.filter(a => a.isTopPick).slice(0, 5);
    }

    static getMockList = buildMockList;
}
