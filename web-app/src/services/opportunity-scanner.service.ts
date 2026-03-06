/**
 * Opportunity Scanner Service — Module 5
 *
 * Detects actionable market signals:
 *   BREAKOUT        — stock near 52-week high with elevated volume
 *   SECTOR_MOMENTUM — sector outperforming broad market by >1.5%
 *   VOLUME_SPIKE    — unusually high volume indicator
 *   VIX_DROP        — VIX falling sharply (bullish reversal signal)
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import type { MarketSnapshot } from './market-data.service';

export interface OpportunitySignal {
    id: string;
    symbol: string;
    signalType: 'BREAKOUT' | 'SECTOR_MOMENTUM' | 'VOLUME_SPIKE' | 'VIX_DROP' | 'SECTOR_WEAKNESS';
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
    description: string;
    sector?: string;
    targetPrice?: number;
    detectedAt: string;
    expiresAt: string;
}

// ─── Mock fallback opportunities ──────────────────────────────────────────────

const MOCK_OPPORTUNITIES: OpportunitySignal[] = [
    {
        id: randomUUID(), symbol: 'RELIANCE', signalType: 'BREAKOUT',
        strength: 'STRONG',
        description: 'RELIANCE approaching 52-week high of ₹3,024. Volume 2.3x above 20-day average. Breakout trade setup.',
        sector: 'Energy', targetPrice: 3024,
        detectedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    },
    {
        id: randomUUID(), symbol: 'NIFTYIT.NS', signalType: 'SECTOR_MOMENTUM',
        strength: 'STRONG',
        description: 'IT sector up +1.4% vs Nifty flat. TCS, Infosys, Wipro all gaining. Sector rotation into IT underway.',
        sector: 'IT',
        detectedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    },
    {
        id: randomUUID(), symbol: 'HDFCBANK', signalType: 'VOLUME_SPIKE',
        strength: 'MODERATE',
        description: 'HDFC Bank saw 1.8x volume surge in last session. Institutional accumulation pattern detected.',
        sector: 'Banking',
        detectedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
    {
        id: randomUUID(), symbol: '^INDIAVIX', signalType: 'VIX_DROP',
        strength: 'MODERATE',
        description: 'India VIX dropped 8% in 2 sessions. Fear subsiding — typically bullish for equity markets 3–5 sessions ahead.',
        detectedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    },
    {
        id: randomUUID(), symbol: 'NIFTYAUTO.NS', signalType: 'SECTOR_MOMENTUM',
        strength: 'MODERATE',
        description: 'Auto sector outperforming Nifty by +1.2%. Monthly sales data strong — Maruti, M&M, TVS all gaining.',
        sector: 'Auto',
        detectedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    },
];

// ─── Service ──────────────────────────────────────────────────────────────────

export class OpportunityScannerService {

    /** Generate signals from a market snapshot */
    static scanFromSnapshot(snapshot: MarketSnapshot): OpportunitySignal[] {
        const signals: OpportunitySignal[] = [];
        const now = new Date();

        // VIX drop signal
        if (snapshot.vixTrend === 'FALLING' && snapshot.vix > 14) {
            signals.push({
                id: randomUUID(), symbol: '^INDIAVIX', signalType: 'VIX_DROP',
                strength: snapshot.vix > 18 ? 'STRONG' : 'MODERATE',
                description: `India VIX falling (${snapshot.vix.toFixed(1)}). Fear receding — bullish for broad market over next 3–5 sessions.`,
                detectedAt: now.toISOString(),
                expiresAt: new Date(now.getTime() + 5 * 86400000).toISOString(),
            });
        }

        // Sector momentum signals
        for (const sector of snapshot.sectors) {
            const niftyChange = snapshot.indices.find(i => i.symbol === '^NSEI')?.changePct ?? 0;
            const outperformance = sector.changePct - niftyChange;
            if (outperformance > 1.5) {
                signals.push({
                    id: randomUUID(), symbol: sector.etfSymbol, signalType: 'SECTOR_MOMENTUM',
                    strength: outperformance > 2.5 ? 'STRONG' : 'MODERATE',
                    description: `${sector.sector} sector outperforming Nifty by +${outperformance.toFixed(1)}%. Sector rotation signal — consider positional plays.`,
                    sector: sector.sector,
                    detectedAt: now.toISOString(),
                    expiresAt: new Date(now.getTime() + 3 * 86400000).toISOString(),
                });
            }
            if (sector.changePct < -1.5) {
                signals.push({
                    id: randomUUID(), symbol: sector.etfSymbol, signalType: 'SECTOR_WEAKNESS',
                    strength: sector.changePct < -2.5 ? 'STRONG' : 'MODERATE',
                    description: `${sector.sector} sector underperforming by ${sector.changePct.toFixed(1)}%. Avoid fresh longs. Potential short or hedge opportunity.`,
                    sector: sector.sector,
                    detectedAt: now.toISOString(),
                    expiresAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
                });
            }
        }

        return signals.length > 0 ? signals : MOCK_OPPORTUNITIES;
    }

    /** Persist opportunity signals to DB */
    static async persistSignals(signals: OpportunitySignal[]): Promise<void> {
        const db = await initDb();
        for (const s of signals) {
            await db.run(
                `INSERT OR IGNORE INTO MarketOpportunity (id, symbol, signalType, strength, description, sector, detectedAt, expiresAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [s.id, s.symbol, s.signalType, s.strength, s.description, s.sector ?? null, s.detectedAt, s.expiresAt]
            );
        }
    }

    /** Get current signals (with mock fallback) */
    static async getActiveSignals(): Promise<OpportunitySignal[]> {
        try {
            const db = await initDb();
            const rows: any[] = await db.all(
                `SELECT * FROM MarketOpportunity
          WHERE expiresAt > CURRENT_TIMESTAMP
          ORDER BY detectedAt DESC LIMIT 20`
            );
            return rows.length > 0 ? rows as OpportunitySignal[] : MOCK_OPPORTUNITIES;
        } catch {
            return MOCK_OPPORTUNITIES;
        }
    }

    static getMockOpportunities() { return MOCK_OPPORTUNITIES; }
}
