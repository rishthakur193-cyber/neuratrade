/**
 * Daily Summary Service — Module 7
 *
 * Generates an AI-written daily market intelligence report using Google Gemini.
 * Falls back to a structured template when Gemini API key is not configured.
 */

import type { MarketSnapshot, MarketCondition } from './market-data.service';
import type { AdvisorRank } from './advisor-correlation.service';
import type { OpportunitySignal } from './opportunity-scanner.service';

export interface DailySummary {
    date: string;
    headline: string;
    marketBrief: string;
    strategyInsight: string;
    riskWarning: string;
    opportunities: string;
    topStrategy: string;
    generatedBy: 'GEMINI' | 'TEMPLATE';
}

// ─── Template fallback ────────────────────────────────────────────────────────

function buildTemplate(
    snapshot: MarketSnapshot,
    topAdvisors: AdvisorRank[],
    signals: OpportunitySignal[],
): DailySummary {
    const condition = snapshot.marketCondition;
    const topSector = [...snapshot.sectors].sort((a, b) => b.changePct - a.changePct)[0];
    const botSector = [...snapshot.sectors].sort((a, b) => a.changePct - b.changePct)[0];
    const nifty = snapshot.indices.find(i => i.symbol === '^NSEI');
    const topAdvisor = topAdvisors[0];
    const sigCount = signals.length;

    const conditionDescriptions: Record<MarketCondition, string> = {
        TRENDING_UP: 'strongly bullish with broad-based participation',
        TRENDING_DOWN: 'under selling pressure with weak market breadth',
        HIGH_VOLATILITY: 'highly volatile with elevated fear index (VIX)',
        SECTOR_ROTATION: 'experiencing sector rotation with mixed breadth',
        RANGING: 'in consolidation with low directional conviction',
    };

    return {
        date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        headline: `Market ${conditionDescriptions[condition]} — ${sigCount} opportunity signal${sigCount !== 1 ? 's' : ''} detected`,
        marketBrief: `Nifty 50 at ${nifty ? `₹${nifty.price.toLocaleString('en-IN')} (${nifty.changePct >= 0 ? '+' : ''}${nifty.changePct.toFixed(2)}%)` : 'levels'} with India VIX at ${snapshot.vix.toFixed(1)} (${snapshot.vixTrend}). Market is ${conditionDescriptions[condition]}. ${topSector ? `Leading sector: ${topSector.sector} (+${topSector.changePct.toFixed(2)}%). ` : ''}${botSector ? `Lagging sector: ${botSector.sector} (${botSector.changePct.toFixed(2)}%).` : ''}`,
        strategyInsight: condition === 'HIGH_VOLATILITY'
            ? 'Intraday and options strategies offer the best risk-adjusted returns today. Avoid fresh positional trades. Keep stop-losses tight. Use volatility to your advantage with defined-risk options plays.'
            : condition === 'TRENDING_UP'
                ? 'Momentum and positional strategies are clearly favored. Buy dips in quality stocks. Sector leaders are leading reliably. Positional traders should allow profits to run.'
                : condition === 'SECTOR_ROTATION'
                    ? 'Capital is rotating between sectors. Identify the gaining sectors early and build positional exposure. Diversified advisors covering multiple sectors will outperform single-sector specialists today.'
                    : condition === 'TRENDING_DOWN'
                        ? 'Capital preservation is the priority. Avoid fresh long positions on broad indices. Options strategies (long puts, protective hedges) are favored. Only trade sector-specific short-term opportunities.'
                        : 'Market is in a range. Options premium selling strategies are most effective. Swing traders should buy near support and sell near resistance. Avoid leverage.',
        riskWarning: snapshot.vix > 20
            ? `⚠️ ELEVATED RISK: India VIX at ${snapshot.vix.toFixed(1)} indicates market stress. Reduce position sizes by 30–50%. Ensure all positions have defined stop-losses.`
            : snapshot.vix < 12
                ? `⚠️ LOW VIX COMPLACENCY: VIX at ${snapshot.vix.toFixed(1)} signals calm — but complacency often precedes sharp selloffs. Do not increase leverage.`
                : `Risk levels are within normal range (VIX ${snapshot.vix.toFixed(1)}). Standard position sizing and risk management protocols apply.`,
        opportunities: signals.slice(0, 3).map(s => `${s.signalType.replace('_', ' ')}: ${s.description}`).join(' | ') || 'No high-confidence opportunities detected today. Wait for clearer signals.',
        topStrategy: topAdvisor
            ? `${topAdvisor.advisorName}'s ${topAdvisor.strategy} strategy is the best match for today's market (Score: ${topAdvisor.advantageScore}/100 — ${topAdvisor.verdict.replace('_', ' ')})`
            : 'No advisors profiled yet — add advisors to see strategy advantage rankings.',
        generatedBy: 'TEMPLATE',
    };
}

// ─── Gemini AI generation ─────────────────────────────────────────────────────

async function generateWithGemini(
    snapshot: MarketSnapshot,
    topAdvisors: AdvisorRank[],
    signals: OpportunitySignal[],
): Promise<DailySummary | null> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key') return null;

    try {
        const nifty = snapshot.indices.find(i => i.symbol === '^NSEI');
        const prompt = `You are an expert Indian stock market analyst writing a daily intelligence briefing for retail investors.

Market Data:
- Nifty 50: ${nifty?.price} (${nifty?.changePct}% change)
- India VIX: ${snapshot.vix} (${snapshot.vixTrend})
- Market Condition: ${snapshot.marketCondition}
- Top Sectors: ${snapshot.sectors.slice(0, 3).map(s => `${s.sector} ${s.changePct}%`).join(', ')}
- Signals: ${signals.length} detected (${signals.map(s => s.signalType).slice(0, 3).join(', ')})
- Best Advisor Strategy Today: ${topAdvisors[0]?.strategy} (${topAdvisors[0]?.advantageScore}/100)

Write a concise daily market intelligence briefing with EXACTLY these 5 sections (each 1-2 sentences):
1. MARKET_BRIEF: What is the market doing today?
2. STRATEGY_INSIGHT: Which strategies and advisor types benefit most?
3. RISK_WARNING: What risks should investors be aware of?
4. OPPORTUNITIES: What specific actionable signals exist?
5. HEADLINE: A single punchy headline summarising the day.

Format: JSON object with keys: headline, marketBrief, strategyInsight, riskWarning, opportunities`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                }),
                signal: AbortSignal.timeout(10000),
            }
        );

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;

        const parsed = JSON.parse(text);
        return {
            date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            headline: parsed.headline ?? 'Market Intelligence Daily Briefing',
            marketBrief: parsed.marketBrief ?? '',
            strategyInsight: parsed.strategyInsight ?? '',
            riskWarning: parsed.riskWarning ?? '',
            opportunities: parsed.opportunities ?? '',
            topStrategy: topAdvisors[0]
                ? `${topAdvisors[0].advisorName}'s ${topAdvisors[0].strategy} strategy — Score ${topAdvisors[0].advantageScore}/100`
                : '',
            generatedBy: 'GEMINI',
        };
    } catch {
        return null;
    }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class DailySummaryService {

    static async generate(
        snapshot: MarketSnapshot,
        topAdvisors: AdvisorRank[],
        signals: OpportunitySignal[],
    ): Promise<DailySummary> {
        // Try Gemini first
        const geminiResult = await generateWithGemini(snapshot, topAdvisors, signals);
        if (geminiResult) return geminiResult;

        // Fall back to rich template
        return buildTemplate(snapshot, topAdvisors, signals);
    }
}
