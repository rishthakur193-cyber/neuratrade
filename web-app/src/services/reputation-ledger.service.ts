/**
 * Reputation Ledger Service — Ecosystem Growth Engine Module 2
 *
 * Stores an immutable, append-only performance history for each advisor.
 * Each yearly record includes an integrity hash so tampering is detectable.
 *
 * ADDITIVE: does not modify any existing service.
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

export interface LedgerEntry {
    id: string;
    advisorId: string;
    year: number;
    winRate: number;
    maxDrawdown: number;
    avgMonthlyReturn: number;
    strategyType: string;
    trustScore: number;
    totalTrades: number;
    integrityHash: string;
    recordedAt: string;
    verified: boolean;
}

export interface LedgerSummary {
    advisorId: string;
    totalYears: number;
    avgWinRate: number;
    bestYear: number;
    worstDrawdown: number;
    strategyEvolution: string[];
    isIntegrityValid: boolean;
    entries: LedgerEntry[];
}

// ─── Integrity ────────────────────────────────────────────────────────────────

function buildHash(entry: Omit<LedgerEntry, 'id' | 'integrityHash' | 'recordedAt' | 'verified'>): string {
    const payload = JSON.stringify({
        advisorId: entry.advisorId, year: entry.year,
        winRate: entry.winRate, maxDrawdown: entry.maxDrawdown,
        avgMonthlyReturn: entry.avgMonthlyReturn, trustScore: entry.trustScore,
    });
    return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

function verifyHash(entry: LedgerEntry): boolean {
    const expected = buildHash(entry);
    return entry.integrityHash === expected;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

function getMockLedger(advisorId: string): LedgerEntry[] {
    const data = [
        { year: 2022, winRate: 58, maxDrawdown: 14.2, avgMonthlyReturn: 1.8, strategyType: 'SWING', trustScore: 68, totalTrades: 142 },
        { year: 2023, winRate: 65, maxDrawdown: 10.4, avgMonthlyReturn: 2.4, strategyType: 'SWING', trustScore: 76, totalTrades: 178 },
        { year: 2024, winRate: 71, maxDrawdown: 7.8, avgMonthlyReturn: 2.9, strategyType: 'INTRADAY', trustScore: 86, totalTrades: 214 },
        { year: 2025, winRate: 74, maxDrawdown: 6.2, avgMonthlyReturn: 3.2, strategyType: 'INTRADAY', trustScore: 94, totalTrades: 231 },
    ];
    return data.map(d => {
        const base = { advisorId, ...d, id: randomUUID(), integrityHash: '', recordedAt: `${d.year}-12-31T00:00:00.000Z`, verified: true };
        return { ...base, integrityHash: buildHash(base), verified: true };
    });
}

function getMockSummary(advisorId: string): LedgerSummary {
    const entries = getMockLedger(advisorId);
    const avgWR = Math.round(entries.reduce((s, e) => s + e.winRate, 0) / entries.length);
    const worstDD = Math.max(...entries.map(e => e.maxDrawdown));
    const strats = [...new Set(entries.map(e => e.strategyType))];
    const best = entries.reduce((a, b) => a.winRate > b.winRate ? a : b).year;
    return {
        advisorId, totalYears: entries.length, avgWinRate: avgWR,
        bestYear: best, worstDrawdown: worstDD,
        strategyEvolution: strats,
        isIntegrityValid: entries.every(verifyHash),
        entries,
    };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class ReputationLedgerService {

    /** Append-only: never updates existing records */
    static async appendEntry(advisorId: string, data: {
        year: number; winRate: number; maxDrawdown: number;
        avgMonthlyReturn: number; strategyType: string; trustScore: number; totalTrades: number;
    }): Promise<LedgerEntry> {
        const id = randomUUID();
        const base = { id, advisorId, ...data, integrityHash: '', recordedAt: new Date().toISOString(), verified: true };
        const hash = buildHash(base);
        try {
            const db = await initDb();
            await db.run(
                `INSERT INTO ReputationLedgerEntry (id, advisorId, year, winRate, maxDrawdown, avgMonthlyReturn, strategyType, trustScore, totalTrades, integrityHash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, advisorId, data.year, data.winRate, data.maxDrawdown, data.avgMonthlyReturn, data.strategyType, data.trustScore, data.totalTrades, hash]
            );
        } catch { /* non-fatal */ }
        return { ...base, integrityHash: hash };
    }

    static async getLedger(advisorId: string): Promise<LedgerSummary> {
        try {
            const db = await initDb();
            const rows: any[] = await db.all(
                'SELECT * FROM ReputationLedgerEntry WHERE advisorId = ? ORDER BY year ASC',
                [advisorId]
            );
            if (rows && rows.length > 0) {
                const entries: LedgerEntry[] = rows.map(r => ({ ...r, verified: verifyHash(r) }));
                const avgWR = Math.round(entries.reduce((s, e) => s + e.winRate, 0) / entries.length);
                const worstDD = Math.max(...entries.map(e => e.maxDrawdown));
                const strats = [...new Set(entries.map(e => e.strategyType))];
                const best = entries.reduce((a, b) => a.winRate > b.winRate ? a : b).year;
                return {
                    advisorId, totalYears: entries.length, avgWinRate: avgWR,
                    bestYear: best, worstDrawdown: worstDD, strategyEvolution: strats,
                    isIntegrityValid: entries.every(e => e.verified),
                    entries,
                };
            }
        } catch { /* fall through */ }
        return getMockSummary(advisorId);
    }

    static getMockLedger = getMockLedger;
    static getMockSummary = getMockSummary;
}
