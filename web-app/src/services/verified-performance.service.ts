/**
 * Advisor Verified Performance Service
 *
 * The tamper-proof verification pipeline:
 * 1. Broker Link   — advisor authenticates with Angel One MPIN
 * 2. Trade Fetch   — system pulls trade book directly from broker API
 * 3. Cross-Ref     — matched vs stated recommendations (±2% price, ±3d date)
 * 4. Badge Award   — Platinum / Gold / Silver / Unverified based on match %
 *
 * Advisors cannot edit VerifiedTrade rows — they are broker-fetched and immutable.
 */

import { initDb } from '@/lib/db';
import { SmartApiService } from './smartapi.service';
import { randomUUID } from 'crypto';

// ─── Types ───────────────────────────────────────────────────────────────────

export type VerificationStatus = 'BROKER_VERIFIED' | 'UNVERIFIED' | 'MISMATCH';
export type BadgeLevel = 'PLATINUM' | 'GOLD' | 'SILVER' | 'UNVERIFIED';

export interface VerifiedTradeRow {
    id: string;
    advisorId: string;
    symbol: string;
    exchange: string;
    brokerOrderId?: string;
    entryPrice: number;
    exitPrice?: number;
    stopLoss?: number;
    target?: number;
    qty: number;
    returnPct?: number;
    holdingDays: number;
    result?: 'WIN' | 'LOSS' | 'BREAKEVEN';
    verificationStatus: VerificationStatus;
    brokerSource: string;
    mismatchReason?: string;
    tradedAt: string;
    closedAt?: string;
}

export interface VerificationBadge {
    advisorId: string;
    advisorName: string;
    sebiRegNo?: string;
    badgeLevel: BadgeLevel;
    verifiedTradeCount: number;
    totalTradeCount: number;
    verificationPct: number;
    lastVerifiedAt?: string;
    brokerLinked: boolean;
    stats: {
        winRate: number;
        avgReturn: number;
        maxDrawdown: number;
        bestTrade: number;
        worstTrade: number;
        profitFactor: number;
    };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PRICE_TOLERANCE = 0.02;  // ±2% price match window
const DATE_TOLERANCE_DAYS = 3;  // ±3 calendar days

const BADGE_THRESHOLDS = {
    PLATINUM: 0.80,
    GOLD: 0.60,
    SILVER: 0.40,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function priceWithinTolerance(claimed: number, actual: number): boolean {
    return Math.abs((actual - claimed) / claimed) <= PRICE_TOLERANCE;
}

function datesWithinTolerance(claimedDate: string, actualDate: string): boolean {
    const diff = Math.abs(new Date(claimedDate).getTime() - new Date(actualDate).getTime());
    return diff <= DATE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000;
}

function deriveBadge(pct: number): BadgeLevel {
    if (pct >= BADGE_THRESHOLDS.PLATINUM) return 'PLATINUM';
    if (pct >= BADGE_THRESHOLDS.GOLD) return 'GOLD';
    if (pct >= BADGE_THRESHOLDS.SILVER) return 'SILVER';
    return 'UNVERIFIED';
}

function computeStatsFromTrades(trades: VerifiedTradeRow[]) {
    const closed = trades.filter(t => t.result !== null && t.result !== undefined);
    const returns = closed.map(t => t.returnPct ?? 0);
    const wins = closed.filter(t => t.result === 'WIN');

    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
    const avgReturn = returns.length > 0
        ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;

    const grossProfit = returns.filter(r => r > 0).reduce((a, b) => a + b, 0);
    const grossLoss = Math.abs(returns.filter(r => r < 0).reduce((a, b) => a + b, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;

    let peak = 100, equity = 100, maxDD = 0;
    for (const r of returns) {
        equity *= (1 + r / 100);
        if (equity > peak) peak = equity;
        const dd = ((peak - equity) / peak) * 100;
        if (dd > maxDD) maxDD = dd;
    }

    return {
        winRate: Math.round(winRate * 10) / 10,
        avgReturn: Math.round(avgReturn * 100) / 100,
        maxDrawdown: Math.round(maxDD * 10) / 10,
        bestTrade: returns.length > 0 ? Math.round(Math.max(...returns) * 100) / 100 : 0,
        worstTrade: returns.length > 0 ? Math.round(Math.min(...returns) * 100) / 100 : 0,
        profitFactor: Math.round(profitFactor * 100) / 100,
    };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class VerifiedPerformanceService {

    /** Link an advisor's Angel One broker account and trigger first sync */
    static async linkBroker(
        advisorId: string,
        clientCode: string,
        mpin: string,
        totp: string
    ): Promise<{ success: boolean; message: string }> {
        const session = await SmartApiService.loginWithMpin(clientCode, mpin, totp);

        const db = await initDb();
        const existing = await db.get(
            'SELECT id FROM AdvisorBrokerLink WHERE advisorId = ?', [advisorId]
        );

        // Store token encoded as base64 (not plain-text) — use proper encryption in production
        const encoded = Buffer.from(session.jwtToken).toString('base64');

        if (existing) {
            await db.run(
                `UPDATE AdvisorBrokerLink
           SET clientCode = ?, encryptedToken = ?, feedToken = ?,
               isActive = 1, lastSyncAt = CURRENT_TIMESTAMP
         WHERE advisorId = ?`,
                [clientCode, encoded, session.feedToken, advisorId]
            );
        } else {
            await db.run(
                `INSERT INTO AdvisorBrokerLink
           (id, advisorId, brokerName, clientCode, encryptedToken, feedToken)
         VALUES (?, ?, 'AngelOne', ?, ?, ?)`,
                [randomUUID(), advisorId, clientCode, encoded, session.feedToken]
            );
        }

        // Trigger sync immediately
        await this.syncAdvisorTrades(advisorId);
        return { success: true, message: 'Broker linked and trades synced successfully' };
    }

    /** Unlink an advisor's broker account */
    static async unlinkBroker(advisorId: string): Promise<void> {
        const db = await initDb();
        await db.run(
            'UPDATE AdvisorBrokerLink SET isActive = 0 WHERE advisorId = ?',
            [advisorId]
        );
    }

    /**
     * Core sync pipeline:
     * 1. Fetch trade book from Angel One
     * 2. Cross-reference against AdvisorRecommendation rows
     * 3. Persist VerifiedTrade rows
     * 4. Recompute badge
     */
    static async syncAdvisorTrades(advisorId: string): Promise<{
        synced: number; verified: number; unverified: number;
    }> {
        const db = await initDb();

        const link = await db.get(
            'SELECT * FROM AdvisorBrokerLink WHERE advisorId = ? AND isActive = 1',
            [advisorId]
        );
        if (!link) return { synced: 0, verified: 0, unverified: 0 };

        // Decode token
        const jwtToken = Buffer.from(link.encryptedToken, 'base64').toString('utf-8');

        // Fetch trade book from broker
        const brokerTrades = await SmartApiService.getTradeBook(jwtToken);

        // Fetch stated recommendations for cross-referencing
        const recommendations = await db.all(
            'SELECT * FROM AdvisorRecommendation WHERE advisorId = ?', [advisorId]
        );

        let verifiedCount = 0, unverifiedCount = 0;

        for (const bt of brokerTrades) {
            const existingVT = await db.get(
                'SELECT id FROM VerifiedTrade WHERE brokerOrderId = ?',
                [bt.orderid ?? bt.uniqueorderid]
            );
            if (existingVT) continue; // Already imported

            // Cross-reference: find a matching recommendation
            const matchedRec = recommendations.find((rec: any) => {
                const symbolMatch = bt.tradingsymbol?.includes(rec.symbol) || rec.symbol?.includes(bt.tradingsymbol);
                const priceMatch = priceWithinTolerance(rec.entryPrice, parseFloat(bt.averageprice ?? bt.price ?? 0));
                const dateMatch = rec.tradedAt ? datesWithinTolerance(rec.tradedAt, bt.updatetime ?? '') : true;
                return symbolMatch && priceMatch && dateMatch;
            });

            const entryPrice = parseFloat(bt.averageprice ?? bt.price ?? 0);
            const exitPrice = bt.exitprice ? parseFloat(bt.exitprice) : undefined;
            const returnPct = exitPrice && entryPrice > 0
                ? ((exitPrice - entryPrice) / entryPrice) * 100 : undefined;
            const result = returnPct !== undefined
                ? (returnPct > 0.5 ? 'WIN' : returnPct < -0.5 ? 'LOSS' : 'BREAKEVEN')
                : undefined;

            const status: VerificationStatus = matchedRec ? 'BROKER_VERIFIED' : 'UNVERIFIED';
            if (matchedRec) verifiedCount++; else unverifiedCount++;

            await db.run(
                `INSERT INTO VerifiedTrade
           (id, advisorId, recommendationId, symbol, exchange, brokerOrderId,
            entryPrice, exitPrice, stopLoss, target, qty, returnPct, holdingDays,
            result, verificationStatus, brokerSource, brokerFetchedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AngelOne', CURRENT_TIMESTAMP)`,
                [
                    randomUUID(), advisorId, matchedRec?.id ?? null,
                    bt.tradingsymbol ?? '', bt.exchange ?? 'NSE',
                    bt.orderid ?? bt.uniqueorderid,
                    entryPrice, exitPrice ?? null,
                    matchedRec?.stopLoss ?? null, matchedRec?.target ?? null,
                    parseInt(bt.quantity ?? '1'),
                    returnPct ?? null, 0,
                    result ?? null, status,
                ]
            );
        }

        // Update sync timestamp
        await db.run(
            'UPDATE AdvisorBrokerLink SET lastSyncAt = CURRENT_TIMESTAMP WHERE advisorId = ?',
            [advisorId]
        );

        // Recompute badge
        await this.recomputeBadge(advisorId);

        return {
            synced: brokerTrades.length,
            verified: verifiedCount,
            unverified: unverifiedCount,
        };
    }

    /** Recompute and persist the verification badge for an advisor */
    static async recomputeBadge(advisorId: string): Promise<BadgeLevel> {
        const db = await initDb();
        const trades = await db.all(
            'SELECT verificationStatus FROM VerifiedTrade WHERE advisorId = ?', [advisorId]
        );

        const total = trades.length;
        const verified = trades.filter((t: any) => t.verificationStatus === 'BROKER_VERIFIED').length;
        const pct = total > 0 ? verified / total : 0;
        const badge = deriveBadge(pct);

        const rec = await db.get(
            'SELECT id FROM AdvisorVerificationBadge WHERE advisorId = ?', [advisorId]
        );
        if (rec) {
            await db.run(
                `UPDATE AdvisorVerificationBadge
           SET badgeLevel = ?, verifiedTradeCount = ?, totalTradeCount = ?,
               verificationPct = ?, lastVerifiedAt = CURRENT_TIMESTAMP,
               updatedAt = CURRENT_TIMESTAMP
         WHERE advisorId = ?`,
                [badge, verified, total, Math.round(pct * 1000) / 10, advisorId]
            );
        } else {
            await db.run(
                `INSERT INTO AdvisorVerificationBadge
           (id, advisorId, badgeLevel, verifiedTradeCount, totalTradeCount,
            verificationPct, lastVerifiedAt)
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [randomUUID(), advisorId, badge, verified, total, Math.round(pct * 1000) / 10]
            );
        }

        return badge;
    }

    /** Get full verified performance profile for one advisor */
    static async getVerifiedProfile(advisorId: string): Promise<VerificationBadge | null> {
        const db = await initDb();

        const advisor = await db.get(
            `SELECT ap.sebiRegNo, u.name
         FROM AdvisorProfile ap
         JOIN User u ON ap.userId = u.id
        WHERE ap.id = ?`,
            [advisorId]
        );
        if (!advisor) return null;

        const badge = await db.get(
            'SELECT * FROM AdvisorVerificationBadge WHERE advisorId = ?', [advisorId]
        );
        const link = await db.get(
            'SELECT id FROM AdvisorBrokerLink WHERE advisorId = ? AND isActive = 1', [advisorId]
        );
        const trades = await db.all(
            'SELECT * FROM VerifiedTrade WHERE advisorId = ? ORDER BY tradedAt DESC', [advisorId]
        );

        const stats = computeStatsFromTrades(trades as VerifiedTradeRow[]);

        return {
            advisorId,
            advisorName: advisor.name,
            sebiRegNo: advisor.sebiRegNo,
            badgeLevel: badge?.badgeLevel ?? 'UNVERIFIED',
            verifiedTradeCount: badge?.verifiedTradeCount ?? 0,
            totalTradeCount: badge?.totalTradeCount ?? trades.length,
            verificationPct: badge?.verificationPct ?? 0,
            lastVerifiedAt: badge?.lastVerifiedAt,
            brokerLinked: !!link,
            stats,
        };
    }

    /** Get verified trade list for an advisor */
    static async getVerifiedTrades(advisorId: string): Promise<VerifiedTradeRow[]> {
        const db = await initDb();
        return db.all(
            'SELECT * FROM VerifiedTrade WHERE advisorId = ? ORDER BY tradedAt DESC LIMIT 100',
            [advisorId]
        );
    }

    /** Get leaderboard of all verified advisors sorted by verification % */
    static async getLeaderboard(): Promise<VerificationBadge[]> {
        const db = await initDb();
        const advisors = await db.all(
            `SELECT avb.*, ap.sebiRegNo, u.name
         FROM AdvisorVerificationBadge avb
         JOIN AdvisorProfile ap ON avb.advisorId = ap.id
         JOIN User u ON ap.userId = u.id
        ORDER BY avb.verificationPct DESC, avb.verifiedTradeCount DESC`
        );

        return advisors.map((a: any) => ({
            advisorId: a.advisorId,
            advisorName: a.name,
            sebiRegNo: a.sebiRegNo,
            badgeLevel: a.badgeLevel,
            verifiedTradeCount: a.verifiedTradeCount,
            totalTradeCount: a.totalTradeCount,
            verificationPct: a.verificationPct,
            lastVerifiedAt: a.lastVerifiedAt,
            brokerLinked: true,
            stats: { winRate: 0, avgReturn: 0, maxDrawdown: 0, bestTrade: 0, worstTrade: 0, profitFactor: 0 },
        }));
    }

    // ─── Mock Data (used when no broker linked) ─────────────────────────────────

    static getMockLeaderboard(): VerificationBadge[] {
        return [
            {
                advisorId: 'mock-2', advisorName: 'Priya Sharma', sebiRegNo: 'INA000023456',
                badgeLevel: 'PLATINUM', verifiedTradeCount: 87, totalTradeCount: 89,
                verificationPct: 97.8, lastVerifiedAt: new Date().toISOString(), brokerLinked: true,
                stats: { winRate: 68, avgReturn: 2.4, maxDrawdown: 7, bestTrade: 8.9, worstTrade: -2.1, profitFactor: 3.1 },
            },
            {
                advisorId: 'mock-4', advisorName: 'Sunita Patel', sebiRegNo: 'INA000045678',
                badgeLevel: 'PLATINUM', verifiedTradeCount: 50, totalTradeCount: 52,
                verificationPct: 96.2, lastVerifiedAt: new Date().toISOString(), brokerLinked: true,
                stats: { winRate: 74, avgReturn: 2.1, maxDrawdown: 5, bestTrade: 7.3, worstTrade: -1.8, profitFactor: 3.6 },
            },
            {
                advisorId: 'mock-1', advisorName: 'Arvind Mehta, CFA', sebiRegNo: 'INA000012345',
                badgeLevel: 'GOLD', verifiedTradeCount: 112, totalTradeCount: 148,
                verificationPct: 75.7, lastVerifiedAt: new Date().toISOString(), brokerLinked: true,
                stats: { winRate: 72, avgReturn: 3.1, maxDrawdown: 11, bestTrade: 12.4, worstTrade: -4.2, profitFactor: 2.8 },
            },
            {
                advisorId: 'mock-3', advisorName: 'Rajesh Kumar SEBI', sebiRegNo: 'INA000034567',
                badgeLevel: 'SILVER', verifiedTradeCount: 170, totalTradeCount: 412,
                verificationPct: 41.3, lastVerifiedAt: new Date().toISOString(), brokerLinked: false,
                stats: { winRate: 61, avgReturn: 1.8, maxDrawdown: 19, bestTrade: 9.2, worstTrade: -7.8, profitFactor: 1.5 },
            },
        ];
    }

    static getMockVerifiedTrades(advisorId: string): VerifiedTradeRow[] {
        const symbols = ['RELIANCE', 'INFY', 'TCS', 'HDFC', 'SBIN', 'ICICIBANK', 'WIPRO', 'HCLTECH', 'ITC', 'LT'];
        return Array.from({ length: 15 }, (_, i) => {
            const entry = 1200 + Math.random() * 800;
            const ret = (Math.random() - 0.3) * 12;
            const exit = entry * (1 + ret / 100);
            const days = Math.floor(Math.random() * 20) + 1;
            const date = new Date(Date.now() - (i * 5 + Math.random() * 3) * 86400000);
            const isVerified = Math.random() > (advisorId === 'mock-3' ? 0.6 : 0.05);
            return {
                id: randomUUID(),
                advisorId,
                symbol: symbols[i % symbols.length],
                exchange: 'NSE',
                brokerOrderId: isVerified ? `OD${Date.now()}${i}` : undefined,
                entryPrice: Math.round(entry * 100) / 100,
                exitPrice: Math.round(exit * 100) / 100,
                stopLoss: Math.round(entry * 0.95 * 100) / 100,
                target: Math.round(entry * 1.08 * 100) / 100,
                qty: Math.floor(Math.random() * 50) + 5,
                returnPct: Math.round(ret * 100) / 100,
                holdingDays: days,
                result: ret > 0.5 ? 'WIN' : ret < -0.5 ? 'LOSS' : 'BREAKEVEN',
                verificationStatus: isVerified ? 'BROKER_VERIFIED' : 'UNVERIFIED',
                brokerSource: isVerified ? 'AngelOne' : 'MANUAL',
                tradedAt: date.toISOString(),
                closedAt: new Date(date.getTime() + days * 86400000).toISOString(),
            };
        });
    }
}
