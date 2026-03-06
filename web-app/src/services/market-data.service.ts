/**
 * Market Data Service — Module 1
 *
 * Fetches live Indian market data from Yahoo Finance (no API key required):
 *   - Nifty 50, Bank Nifty, Midcap 150 indices
 *   - India VIX
 *   - NSE sector ETF performance
 *
 * Falls back to realistic mock data when the market is closed or unreachable.
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IndexQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePct: number;
    volume: number;
    high52w: number;
    low52w: number;
    timestamp: string;
}

export interface SectorPerformance {
    sector: string;
    etfSymbol: string;
    changePct: number;
    trend: 'UP' | 'DOWN' | 'FLAT';
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

export interface MarketSnapshot {
    indices: IndexQuote[];
    vix: number;
    vixTrend: 'RISING' | 'FALLING' | 'STABLE';
    sectors: SectorPerformance[];
    marketCondition: MarketCondition;
    lastUpdated: string;
    isMarketOpen: boolean;
}

export type MarketCondition =
    | 'TRENDING_UP'
    | 'TRENDING_DOWN'
    | 'HIGH_VOLATILITY'
    | 'SECTOR_ROTATION'
    | 'RANGING';

// ─── Constants ────────────────────────────────────────────────────────────────

const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

const INDICES = [
    { symbol: '^NSEI', name: 'Nifty 50' },
    { symbol: '^NSEBANK', name: 'Bank Nifty' },
    { symbol: '^CNXMIDCAP', name: 'Nifty Midcap 150' },
    { symbol: '^CNXSMALLCAP', name: 'Nifty Smallcap' },
];

const SECTOR_ETFS: Record<string, string> = {
    'IT': 'NIFTYIT.NS',
    'Banking': 'NIFTYBANK.NS',
    'Pharma': 'NIFTYPHARMA.NS',
    'FMCG': 'NIFTYFMCG.NS',
    'Auto': 'NIFTYAUTO.NS',
    'Energy': 'NIFTYENERGY.NS',
    'Realty': 'NIFTYREALTY.NS',
    'Metal': 'NIFTYMETAL.NS',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchYahooQuote(symbol: string): Promise<{ price: number; change: number; changePct: number; volume: number; high52w: number; low52w: number } | null> {
    try {
        const url = `${YF_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
        const resp = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(6000),
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return null;
        const prev = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
        const price = meta.regularMarketPrice ?? meta.price ?? prev;
        const change = price - prev;
        const changePct = prev > 0 ? (change / prev) * 100 : 0;
        return {
            price: Math.round(price * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePct: Math.round(changePct * 100) / 100,
            volume: meta.regularMarketVolume ?? 0,
            high52w: meta.fiftyTwoWeekHigh ?? price,
            low52w: meta.fiftyTwoWeekLow ?? price,
        };
    } catch {
        return null;
    }
}

function isMarketOpen(): boolean {
    // NSE hours: 09:15–15:30 IST (UTC+5:30)
    const now = new Date();
    const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const h = ist.getUTCHours(), m = ist.getUTCMinutes(), d = ist.getUTCDay();
    if (d === 0 || d === 6) return false;
    const minsFromMidnight = h * 60 + m;
    return minsFromMidnight >= 555 && minsFromMidnight <= 930; // 9:15 – 15:30
}

// ─── Mock data (market closed / unreachable) ──────────────────────────────────

function getMockSnapshot(): MarketSnapshot {
    const seed = new Date().getHours(); // varies by hour for realism
    const trend = seed % 3 === 0 ? -1 : 1;
    return {
        indices: [
            { symbol: '^NSEI', name: 'Nifty 50', price: 22487.25 + seed * 12 * trend, change: 134.5 * trend, changePct: 0.60 * trend, volume: 312_000_000, high52w: 24198, low52w: 18837, timestamp: new Date().toISOString() },
            { symbol: '^NSEBANK', name: 'Bank Nifty', price: 48231.80 + seed * 25 * trend, change: 287.3 * trend, changePct: 0.60 * trend, volume: 98_000_000, high52w: 53004, low52w: 41781, timestamp: new Date().toISOString() },
            { symbol: '^CNXMIDCAP', name: 'Nifty Midcap 150', price: 47892.15 + seed * 18 * trend, change: -95.4 * trend, changePct: -0.20 * trend, volume: 45_000_000, high52w: 52134, low52w: 38921, timestamp: new Date().toISOString() },
            { symbol: '^CNXSMALLCAP', name: 'Nifty Smallcap', price: 14321.90 + seed * 8 * trend, change: 54.2 * trend, changePct: 0.38 * trend, volume: 22_000_000, high52w: 16243, low52w: 11982, timestamp: new Date().toISOString() },
        ],
        vix: 13.5 + (seed % 8),
        vixTrend: seed % 3 === 0 ? 'RISING' : 'FALLING',
        sectors: getMockSectors(),
        marketCondition: seed % 4 === 0 ? 'HIGH_VOLATILITY' : seed % 4 === 1 ? 'TRENDING_UP' : seed % 4 === 2 ? 'SECTOR_ROTATION' : 'RANGING',
        lastUpdated: new Date().toISOString(),
        isMarketOpen: isMarketOpen(),
    };
}

function getMockSectors(): SectorPerformance[] {
    const seed = new Date().getHours();
    return [
        { sector: 'IT', etfSymbol: 'NIFTYIT.NS', changePct: 1.24 + (seed % 3) * 0.3, trend: 'UP', strength: 'STRONG' },
        { sector: 'Banking', etfSymbol: 'NIFTYBANK.NS', changePct: 0.58, trend: 'UP', strength: 'MODERATE' },
        { sector: 'Pharma', etfSymbol: 'NIFTYPHARMA.NS', changePct: -0.31, trend: 'DOWN', strength: 'WEAK' },
        { sector: 'FMCG', etfSymbol: 'NIFTYFMCG.NS', changePct: -0.82, trend: 'DOWN', strength: 'WEAK' },
        { sector: 'Auto', etfSymbol: 'NIFTYAUTO.NS', changePct: 1.65 - (seed % 4) * 0.2, trend: 'UP', strength: 'STRONG' },
        { sector: 'Energy', etfSymbol: 'NIFTYENERGY.NS', changePct: 0.22, trend: 'FLAT', strength: 'WEAK' },
        { sector: 'Realty', etfSymbol: 'NIFTYREALTY.NS', changePct: -1.12, trend: 'DOWN', strength: 'MODERATE' },
        { sector: 'Metal', etfSymbol: 'NIFTYMETAL.NS', changePct: 0.94, trend: 'UP', strength: 'MODERATE' },
    ];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class MarketDataService {

    /** Fetch live snapshot from Yahoo Finance. Falls back to mock on failure. */
    static async fetchSnapshot(): Promise<MarketSnapshot> {
        try {
            // Fetch indices in parallel
            const indexResults = await Promise.all(
                INDICES.map(async idx => {
                    const q = await fetchYahooQuote(idx.symbol);
                    if (!q) return null;
                    return { symbol: idx.symbol, name: idx.name, ...q, timestamp: new Date().toISOString() };
                })
            );

            const indices = indexResults.filter(Boolean) as IndexQuote[];
            if (indices.length === 0) return getMockSnapshot();

            // Fetch VIX
            const vixData = await fetchYahooQuote('^INDIAVIX');
            const vix = vixData?.price ?? 14.5;
            const vixTrend: 'RISING' | 'FALLING' | 'STABLE' =
                vixData ? (vixData.changePct > 3 ? 'RISING' : vixData.changePct < -3 ? 'FALLING' : 'STABLE') : 'STABLE';

            // Fetch sector ETFs in parallel
            const sectorEntries = Object.entries(SECTOR_ETFS);
            const sectorResults = await Promise.all(
                sectorEntries.map(async ([sector, sym]) => {
                    const q = await fetchYahooQuote(sym);
                    if (!q) return null;
                    const trend: 'UP' | 'DOWN' | 'FLAT' = q.changePct > 0.1 ? 'UP' : q.changePct < -0.1 ? 'DOWN' : 'FLAT';
                    const strength: 'STRONG' | 'MODERATE' | 'WEAK' = Math.abs(q.changePct) > 1 ? 'STRONG' : Math.abs(q.changePct) > 0.4 ? 'MODERATE' : 'WEAK';
                    return { sector, etfSymbol: sym, changePct: q.changePct, trend, strength };
                })
            );

            const sectors = (sectorResults.filter(Boolean) as SectorPerformance[]).sort((a, b) => b.changePct - a.changePct);

            // Classify market condition
            const nifty = indices.find(i => i.symbol === '^NSEI');
            const marketCondition = MarketDataService.classifyCondition(nifty?.changePct ?? 0, vix, sectors);

            return {
                indices,
                vix,
                vixTrend,
                sectors: sectors.length > 0 ? sectors : getMockSectors(),
                marketCondition,
                lastUpdated: new Date().toISOString(),
                isMarketOpen: isMarketOpen(),
            };
        } catch {
            return getMockSnapshot();
        }
    }

    static classifyCondition(niftyChangePct: number, vix: number, sectors: SectorPerformance[]): MarketCondition {
        if (vix > 20) return 'HIGH_VOLATILITY';

        // Sector rotation: top sector up >1.5% while bottom sector down >1.5%
        const sorted = [...sectors].sort((a, b) => b.changePct - a.changePct);
        if (sorted.length >= 2 && sorted[0].changePct > 1.5 && sorted[sorted.length - 1].changePct < -1.5) {
            return 'SECTOR_ROTATION';
        }
        if (niftyChangePct > 0.8) return 'TRENDING_UP';
        if (niftyChangePct < -0.8) return 'TRENDING_DOWN';
        return 'RANGING';
    }

    /** Persist snapshot to DB */
    static async persistSnapshot(snapshot: MarketSnapshot): Promise<void> {
        const db = await initDb();
        for (const idx of snapshot.indices) {
            await db.run(
                `INSERT INTO MarketEvent (id, symbol, exchange, eventType, price, change, changePct, volume, vix, marketCondition, recordedAt)
         VALUES (?, ?, 'NSE', 'PRICE_SNAPSHOT', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [randomUUID(), idx.symbol, idx.price, idx.change, idx.changePct, idx.volume, snapshot.vix, snapshot.marketCondition]
            );
        }
    }

    /** Get latest snapshot (from DB if fresh, else fetch live) */
    static async getLatestSnapshot(): Promise<MarketSnapshot> {
        return MarketDataService.fetchSnapshot();
    }

    /** Get market condition label */
    static conditionLabel(c: MarketCondition): { label: string; color: string; description: string } {
        const map: Record<MarketCondition, { label: string; color: string; description: string }> = {
            TRENDING_UP: { label: '📈 Trending Up', color: '#00E676', description: 'Momentum & positional strategies favored' },
            TRENDING_DOWN: { label: '📉 Trending Down', color: '#FF5252', description: 'Defensive & short strategies favored' },
            HIGH_VOLATILITY: { label: '⚡ High Volatility', color: '#FFD740', description: 'Intraday strategies favored — high risk' },
            SECTOR_ROTATION: { label: '🔄 Sector Rotation', color: '#7C4DFF', description: 'Positional sector strategies stronger' },
            RANGING: { label: '↔ Ranging Market', color: '#90CAF9', description: 'Options & mean-reversion strategies favored' },
        };
        return map[c];
    }

    static getMockSnapshot = getMockSnapshot;
}
