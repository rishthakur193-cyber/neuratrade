"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type MarketCondition = "TRENDING_UP" | "TRENDING_DOWN" | "HIGH_VOLATILITY" | "SECTOR_ROTATION" | "RANGING";
interface IndexQuote { symbol: string; name: string; price: number; change: number; changePct: number; volume: number; }
interface SectorPerf { sector: string; changePct: number; trend: string; strength: string; }
interface AdvisorRank { advisorId: string; advisorName: string; strategy: string; advantageScore: number; verdict: string; reasoning: string; verificationBadge?: string; winRate?: number; }
interface Alert { id: string; alertType: string; severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; message: string; advisorName?: string; }
interface Signal { id: string; symbol: string; signalType: string; strength: string; description: string; sector?: string; }
interface DailySummary { date: string; headline: string; marketBrief: string; strategyInsight: string; riskWarning: string; opportunities: string; topStrategy: string; generatedBy: string; }
interface Snapshot { indices: IndexQuote[]; vix: number; vixTrend: string; marketCondition: MarketCondition; isMarketOpen: boolean; lastUpdated: string; }
interface Environment { primaryInsight: string; secondaryInsights: string[]; riskLevel: string; riskColor: string; recommendedHoldingPeriod: string; strategyRankings: { strategy: string; advantageScore: number; verdict: string }[]; }

// ─── Config ───────────────────────────────────────────────────────────────────
const CONDITION_CONFIG: Record<MarketCondition, { label: string; color: string; bg: string; icon: string }> = {
    TRENDING_UP: { label: "📈 Trending Up", color: "#00E676", bg: "rgba(0,230,118,0.1)", icon: "📈" },
    TRENDING_DOWN: { label: "📉 Trending Down", color: "#FF5252", bg: "rgba(255,82,82,0.1)", icon: "📉" },
    HIGH_VOLATILITY: { label: "⚡ High Volatility", color: "#FFD740", bg: "rgba(255,215,64,0.1)", icon: "⚡" },
    SECTOR_ROTATION: { label: "🔄 Sector Rotation", color: "#7C4DFF", bg: "rgba(124,77,255,0.1)", icon: "🔄" },
    RANGING: { label: "↔ Ranging Market", color: "#90CAF9", bg: "rgba(144,202,249,0.1)", icon: "↔" },
};
const SEV_COLOR = { LOW: "#90CAF9", MEDIUM: "#FFD740", HIGH: "#FF9800", CRITICAL: "#FF5252" };
const VERDICT_COLOR: Record<string, string> = { STRONG_ADVANTAGE: "#00E676", ADVANTAGE: "#69F0AE", NEUTRAL: "#90CAF9", DISADVANTAGE: "#FF5252" };
const SIG_ICON: Record<string, string> = { BREAKOUT: "🚀", SECTOR_MOMENTUM: "🌊", VOLUME_SPIKE: "🔊", VIX_DROP: "🕊️", SECTOR_WEAKNESS: "⚠️" };

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GC({ children, style = {}, glow = "" }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${glow || "rgba(255,255,255,0.07)"}`, borderRadius: 18, backdropFilter: "blur(16px)", boxShadow: glow ? `0 0 28px ${glow}40` : "none", ...style }}>
            {children}
        </div>
    );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SH({ icon, title, sub }: { icon: string; title: string; sub?: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{title}</div>
                {sub && <div style={{ fontSize: 10, color: "#546e7a", marginTop: 1 }}>{sub}</div>}
            </div>
        </div>
    );
}

// ─── VIX Gauge ────────────────────────────────────────────────────────────────
function VixGauge({ vix, trend }: { vix: number; trend: string }) {
    const max = 40;
    const angle = Math.min((vix / max) * 180, 180) - 90;
    const color = vix > 25 ? "#FF5252" : vix > 18 ? "#FFD740" : vix > 13 ? "#90CAF9" : "#00E676";
    const zone = vix > 25 ? "EXTREME" : vix > 18 ? "HIGH" : vix > 13 ? "MODERATE" : "LOW";
    return (
        <div style={{ textAlign: "center" }}>
            <svg viewBox="0 0 200 110" style={{ width: "100%", maxWidth: 240, margin: "0 auto", display: "block" }}>
                {/* Track arcs */}
                {[["#00E676", 180, 225], ["#90CAF9", 225, 270], ["#FFD740", 270, 315], ["#FF5252", 315, 360]].map(([c, s, e], i) => (
                    <path key={i}
                        d={`M ${100 + 80 * Math.cos(((s as number) * Math.PI) / 180)} ${100 + 80 * Math.sin(((s as number) * Math.PI) / 180)} A 80 80 0 0 1 ${100 + 80 * Math.cos(((e as number) * Math.PI) / 180)} ${100 + 80 * Math.sin(((e as number) * Math.PI) / 180)}`}
                        fill="none" stroke={c as string} strokeWidth={14} strokeLinecap="round" opacity={0.3} />
                ))}
                {/* Needle */}
                <motion.line
                    x1="100" y1="100"
                    animate={{ x2: 100 + 65 * Math.cos((angle * Math.PI) / 180), y2: 100 + 65 * Math.sin((angle * Math.PI) / 180) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    stroke={color} strokeWidth={3} strokeLinecap="round" />
                <circle cx="100" cy="100" r="6" fill={color} />
                {/* Labels */}
                {[["LOW", 180], ["MOD", 225], ["HIGH", 270], ["EXT", 315]].map(([label, deg]) => (
                    <text key={label} x={100 + 95 * Math.cos((parseInt(String(deg)) * Math.PI) / 180)} y={100 + 95 * Math.sin((parseInt(String(deg)) * Math.PI) / 180)}
                        textAnchor="middle" fontSize="7" fill="#546e7a" fontWeight={700}>{label}</text>
                ))}
            </svg>
            <div style={{ fontSize: 32, fontWeight: 900, color, marginTop: -8 }}>{vix.toFixed(1)}</div>
            <div style={{ fontSize: 10, color, fontWeight: 800, letterSpacing: 1 }}>{zone} VOLATILITY</div>
            <div style={{ fontSize: 10, color: "#546e7a", marginTop: 4 }}>VIX {trend === "RISING" ? "⬆" : trend === "FALLING" ? "⬇" : "→"} {trend}</div>
        </div>
    );
}

// ─── Sector Heatmap ───────────────────────────────────────────────────────────
function SectorHeatmap({ sectors }: { sectors: SectorPerf[] }) {
    const max = Math.max(...sectors.map(s => Math.abs(s.changePct)), 0.1);
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {sectors.map((s, i) => {
                const intensity = Math.min(Math.abs(s.changePct) / max, 1);
                const isUp = s.changePct >= 0;
                const bg = isUp ? `rgba(0,230,118,${0.08 + intensity * 0.3})` : `rgba(255,82,82,${0.08 + intensity * 0.3})`;
                const border = isUp ? `rgba(0,230,118,${0.2 + intensity * 0.4})` : `rgba(255,82,82,${0.2 + intensity * 0.4})`;
                return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }} whileHover={{ scale: 1.05, zIndex: 10 }}
                        style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 8px", textAlign: "center", cursor: "default" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s.sector}</div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: isUp ? "#00E676" : "#FF5252" }}>{pct(s.changePct)}</div>
                        <div style={{ fontSize: 8, color: "#78909c", marginTop: 3, fontWeight: 700 }}>{s.strength}</div>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── Index Cards ──────────────────────────────────────────────────────────────
function IndexCards({ indices }: { indices: IndexQuote[] }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {indices.map((idx, i) => {
                const up = idx.changePct >= 0;
                const c = up ? "#00E676" : "#FF5252";
                return (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <GC glow={c} style={{ padding: "16px 14px" }}>
                            <div style={{ fontSize: 10, color: "#78909c", fontWeight: 700, marginBottom: 6 }}>{idx.name}</div>
                            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>₹{fmt(idx.price)}</div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: c }}>{up ? "▲" : "▼"} {pct(idx.changePct)}</span>
                            </div>
                            <div style={{ fontSize: 9, color: "#546e7a", marginTop: 6 }}>Vol: {(idx.volume / 1e6).toFixed(0)}M</div>
                        </GC>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── Advisor Rankings ─────────────────────────────────────────────────────────
function AdvisorRankings({ rankings, condition }: { rankings: AdvisorRank[]; condition: MarketCondition }) {
    const cfg = CONDITION_CONFIG[condition];
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rankings.map((r, i) => {
                const vc = VERDICT_COLOR[r.verdict] ?? "#90CAF9";
                return (
                    <motion.div key={r.advisorId} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                        <GC style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ fontWeight: 900, fontSize: 18, color: cfg.color, width: 26, textAlign: "center" }}>
                                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: 13 }}>{r.advisorName}</div>
                                    <div style={{ fontSize: 10, color: "#546e7a", marginTop: 2 }}>{r.strategy} Strategy</div>
                                </div>
                                {/* Score bar */}
                                <div style={{ width: 120 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 9, color: "#546e7a", fontWeight: 700 }}>Advantage</span>
                                        <span style={{ fontSize: 12, fontWeight: 900, color: vc }}>{r.advantageScore}</span>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${r.advantageScore}%` }} transition={{ duration: 0.8, delay: i * 0.06 }}
                                            style={{ height: "100%", background: `linear-gradient(90deg, ${vc}80, ${vc})`, borderRadius: 2 }} />
                                    </div>
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 5, background: `${vc}15`, color: vc, whiteSpace: "nowrap" }}>
                                    {r.verdict.replace(/_/g, " ")}
                                </span>
                                {r.verificationBadge && (
                                    <span style={{ fontSize: 8, color: r.verificationBadge === "PLATINUM" ? "#E5E4E2" : r.verificationBadge === "GOLD" ? "#FFD700" : "#C0C0C0" }}>
                                        {r.verificationBadge === "PLATINUM" ? "💎" : r.verificationBadge === "GOLD" ? "🥇" : "🥈"}
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: 10, color: "#546e7a", marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>{r.reasoning}</div>
                        </GC>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── Risk Alerts ──────────────────────────────────────────────────────────────
function RiskAlerts({ alerts }: { alerts: Alert[] }) {
    if (alerts.length === 0) {
        return <GC style={{ padding: 24, textAlign: "center" }}><div style={{ color: "#00E676", fontSize: 14 }}>✅ No active risk alerts for your portfolio</div></GC>;
    }
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.map((a, i) => {
                const c = SEV_COLOR[a.severity];
                return (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <GC glow={c} style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, marginTop: 4, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                        <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: `${c}15`, color: c }}>
                                            {a.severity}
                                        </span>
                                        <span style={{ fontSize: 9, color: "#546e7a", fontWeight: 700 }}>{a.alertType.replace(/_/g, " ")}</span>
                                        {a.advisorName && <span style={{ fontSize: 9, color: "#78909c" }}>— {a.advisorName}</span>}
                                    </div>
                                    <div style={{ fontSize: 12, lineHeight: 1.6, color: "#b0bec5" }}>{a.message}</div>
                                </div>
                            </div>
                        </GC>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── Opportunity Feed ─────────────────────────────────────────────────────────
function OpportunityFeed({ signals }: { signals: Signal[] }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {signals.map((s, i) => {
                const icon = SIG_ICON[s.signalType] ?? "🔭";
                const color = s.strength === "STRONG" ? "#00E676" : s.strength === "MODERATE" ? "#FFD740" : "#90CAF9";
                return (
                    <motion.div key={s.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <GC style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                                        <span style={{ fontWeight: 800, fontSize: 12 }}>{s.symbol}</span>
                                        <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: `${color}15`, color }}>{s.strength}</span>
                                        {s.sector && <span style={{ fontSize: 9, color: "#546e7a" }}>{s.sector}</span>}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#78909c", fontWeight: 700, letterSpacing: 0.4, marginBottom: 4 }}>{s.signalType.replace(/_/g, " ")}</div>
                                    <div style={{ fontSize: 11, color: "#90a4ae", lineHeight: 1.6 }}>{s.description}</div>
                                </div>
                            </div>
                        </GC>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── Daily Briefing ───────────────────────────────────────────────────────────
function DailyBriefing({ summary }: { summary: DailySummary }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Headline */}
            <div style={{ padding: "14px 18px", background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.2)", borderRadius: 12 }}>
                <div style={{ fontSize: 9, color: "#7c4dff", fontWeight: 800, letterSpacing: 0.6, marginBottom: 6 }}>
                    {summary.generatedBy === "GEMINI" ? "🤖 AI GENERATED · GEMINI" : "📋 DAILY BRIEFING"} · {summary.date}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.5 }}>{summary.headline}</div>
            </div>
            {/* Sections */}
            {[
                { icon: "📊", label: "Market Overview", text: summary.marketBrief },
                { icon: "🧠", label: "Strategy Insight", text: summary.strategyInsight },
                { icon: "⚠️", label: "Risk Warning", text: summary.riskWarning },
                { icon: "🔭", label: "Opportunities", text: summary.opportunities },
            ].map(({ icon, label, text }) => (
                <div key={label} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.025)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: 10, color: "#78909c", fontWeight: 800, marginBottom: 6 }}>{icon} {label}</div>
                    <div style={{ fontSize: 12, color: "#90a4ae", lineHeight: 1.7 }}>{text}</div>
                </div>
            ))}
            {summary.topStrategy && (
                <div style={{ padding: "10px 14px", background: "rgba(0,230,118,0.06)", border: "1px solid rgba(0,230,118,0.15)", borderRadius: 10 }}>
                    <div style={{ fontSize: 10, color: "#00e676", fontWeight: 800, marginBottom: 4 }}>🏆 Today's Best Strategy</div>
                    <div style={{ fontSize: 12, color: "#b0bec5" }}>{summary.topStrategy}</div>
                </div>
            )}
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const TABS = [
    { id: "overview", label: "📊 Market Pulse" },
    { id: "sectors", label: "🗺️ Sector Map" },
    { id: "advisors", label: "🏆 Advisor Rankings" },
    { id: "alerts", label: "⚠️ Risk Alerts" },
    { id: "signals", label: "🔭 Opportunity Scanner" },
    { id: "briefing", label: "📝 AI Briefing" },
] as const;
type Tab = typeof TABS[number]["id"];

const REFRESH_INTERVAL = 60_000; // 60 seconds

export default function MarketIntelligencePage() {
    const [tab, setTab] = useState<Tab>("overview");
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [environment, setEnvironment] = useState<Environment | null>(null);
    const [sectors, setSectors] = useState<SectorPerf[]>([]);
    const [rankings, setRankings] = useState<AdvisorRank[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [signals, setSignals] = useState<Signal[]>([]);
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState("");
    const [summaryLoading, setSummaryLoading] = useState(false);

    const loadSnapshot = useCallback(async () => {
        try {
            const r = await fetch("/api/market-intelligence/snapshot");
            const d = await r.json();
            setSnapshot(d.snapshot);
            setEnvironment(d.environment);
            setSectors(d.snapshot.sectors ?? []);
            setLastRefresh(new Date().toLocaleTimeString("en-IN"));
        } catch { /* use existing */ }
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [snapRes, rankRes, alertRes, sigRes] = await Promise.all([
                fetch("/api/market-intelligence/snapshot"),
                fetch("/api/market-intelligence/advisor-ranks"),
                fetch("/api/market-intelligence/alerts"),
                fetch("/api/market-intelligence/opportunities"),
            ]);
            const [snapD, rankD, alertD, sigD] = await Promise.all([
                snapRes.json(), rankRes.json(), alertRes.json(), sigRes.json(),
            ]);
            setSnapshot(snapD.snapshot);
            setEnvironment(snapD.environment);
            setSectors(snapD.snapshot?.sectors ?? []);
            setRankings(rankD.rankings ?? []);
            setAlerts(alertD.alerts ?? []);
            setSignals(sigD.signals ?? []);
            setLastRefresh(new Date().toLocaleTimeString("en-IN"));
        } catch { /* keep existing */ }
        setLoading(false);
    }, []);

    const loadBriefing = useCallback(async () => {
        if (summary) return;
        setSummaryLoading(true);
        try {
            const r = await fetch("/api/market-intelligence/daily-summary");
            const d = await r.json();
            setSummary(d.summary);
        } catch { /* skip */ }
        setSummaryLoading(false);
    }, [summary]);

    // Initial load + auto-refresh
    useEffect(() => { loadAll(); }, [loadAll]);
    useEffect(() => {
        const id = setInterval(loadSnapshot, REFRESH_INTERVAL);
        return () => clearInterval(id);
    }, [loadSnapshot]);

    // Load briefing when that tab is activated
    useEffect(() => {
        if (tab === "briefing") loadBriefing();
    }, [tab, loadBriefing]);

    const condition = snapshot?.marketCondition ?? "RANGING";
    const cfg = CONDITION_CONFIG[condition];

    return (
        <div style={{ minHeight: "100vh", background: "#0B0B12", color: "#fff", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Ambient glow */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: "-100px", right: "0", width: 700, height: 700, background: `radial-gradient(circle,${cfg.color}08 0%,transparent 70%)` }} />
                <div style={{ position: "absolute", bottom: "0", left: "-80px", width: 500, height: 500, background: "radial-gradient(circle,rgba(124,77,255,0.06) 0%,transparent 70%)" }} />
            </div>

            <div style={{ position: "relative", zIndex: 10, maxWidth: 1240, margin: "0 auto", padding: "32px 24px" }}>

                {/* ── Header ──────────────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: `linear-gradient(135deg,${cfg.color},#7c4dff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 0 32px ${cfg.color}40` }}>
                        🧠
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>Market Intelligence Engine</h1>
                        <p style={{ margin: 0, fontSize: 11, color: "#546e7a", marginTop: 3 }}>
                            Live NSE/BSE data · Advisor strategy correlation · AI risk alerts · Auto-refresh every 60s
                        </p>
                    </div>
                    {/* KPI chips */}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                        {snapshot && (
                            <>
                                <GC style={{ padding: "10px 16px", textAlign: "center" }}>
                                    <div style={{ fontSize: 11, fontWeight: 900, color: cfg.color }}>
                                        {snapshot.isMarketOpen ? "🟢 LIVE" : "🔵 CLOSED"}
                                    </div>
                                    <div style={{ fontSize: 9, color: "#546e7a", marginTop: 2 }}>NSE STATUS</div>
                                </GC>
                                <GC style={{ padding: "10px 16px", textAlign: "center" }}>
                                    <div style={{ fontSize: 10, fontWeight: 900, color: cfg.color, letterSpacing: 0.4 }}>{cfg.label}</div>
                                    <div style={{ fontSize: 9, color: "#546e7a", marginTop: 2 }}>CONDITION</div>
                                </GC>
                                <GC style={{ padding: "10px 16px", textAlign: "center" }}>
                                    <div style={{ fontSize: 14, fontWeight: 900, color: snapshot.vix > 20 ? "#FFD740" : "#00E676" }}>{snapshot.vix.toFixed(1)}</div>
                                    <div style={{ fontSize: 9, color: "#546e7a", marginTop: 2 }}>INDIA VIX</div>
                                </GC>
                                <GC style={{ padding: "10px 16px", textAlign: "center" }}>
                                    <div style={{ fontSize: 10, fontWeight: 900, color: "#90CAF9" }}>{lastRefresh}</div>
                                    <div style={{ fontSize: 9, color: "#546e7a", marginTop: 2 }}>LAST UPDATE</div>
                                </GC>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Condition banner */}
                {environment && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "12px 18px", borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.color}30`, marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
                        <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, color: cfg.color, fontSize: 13 }}>{environment.primaryInsight}</div>
                            <div style={{ fontSize: 10, color: "#78909c", marginTop: 4 }}>{environment.secondaryInsights.join("  ·  ")}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: 10, color: "#546e7a", fontWeight: 700 }}>HOLDING PERIOD</div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginTop: 2 }}>{environment.recommendedHoldingPeriod}</div>
                        </div>
                    </motion.div>
                )}

                {/* ── Tabs ─────────────────────────────────────────────────────────── */}
                <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{
                                padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11,
                                background: tab === t.id ? `linear-gradient(135deg,${cfg.color},#7c4dff)` : "rgba(255,255,255,0.05)",
                                color: tab === t.id ? "#fff" : "#546e7a", transition: "all 0.2s"
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading && tab === "overview" ? (
                    <div style={{ textAlign: "center", padding: 80, color: "#546e7a" }}>⚙️ Fetching live market intelligence...</div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

                            {/* ── MARKET PULSE ──────────────────────────────────────────── */}
                            {tab === "overview" && snapshot && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                    {/* Index grid */}
                                    <GC style={{ padding: 20 }}>
                                        <SH icon="📈" title="Index Dashboard" sub="NSE live quotes" />
                                        <IndexCards indices={snapshot.indices} />
                                    </GC>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                        {/* VIX Gauge */}
                                        <GC style={{ padding: 24 }}>
                                            <SH icon="🌡️" title="India VIX" sub="Volatility Index" />
                                            <VixGauge vix={snapshot.vix} trend={snapshot.vixTrend} />
                                        </GC>

                                        {/* Strategy quick view */}
                                        <GC style={{ padding: 20 }}>
                                            <SH icon="⚖️" title="Strategy Environment" sub="Today's scores" />
                                            {environment?.strategyRankings.slice(0, 5).map((r) => (
                                                <div key={r.strategy} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                                    <div style={{ width: 72, fontSize: 10, fontWeight: 700, color: "#90a4ae" }}>{r.strategy}</div>
                                                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${r.advantageScore}%` }} transition={{ duration: 0.8 }}
                                                            style={{ height: "100%", borderRadius: 3, background: VERDICT_COLOR[r.verdict] ?? "#90CAF9" }} />
                                                    </div>
                                                    <div style={{ width: 30, fontSize: 12, fontWeight: 800, color: VERDICT_COLOR[r.verdict] ?? "#90CAF9", textAlign: "right" }}>{r.advantageScore}</div>
                                                </div>
                                            ))}
                                        </GC>
                                    </div>
                                </div>
                            )}

                            {/* ── SECTOR MAP ────────────────────────────────────────────── */}
                            {tab === "sectors" && (
                                <GC style={{ padding: 24 }}>
                                    <SH icon="🗺️" title="Sector Strength Heatmap" sub="NSE sector ETF performance" />
                                    {sectors.length > 0
                                        ? <SectorHeatmap sectors={sectors} />
                                        : <div style={{ color: "#546e7a", textAlign: "center", padding: 40 }}>Loading sector data...</div>
                                    }
                                </GC>
                            )}

                            {/* ── ADVISOR RANKINGS ──────────────────────────────────────── */}
                            {tab === "advisors" && (
                                <div>
                                    <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.color}30`, fontSize: 11, color: cfg.color, fontWeight: 700 }}>
                                        {cfg.icon} Showing advisor strategy advantage for current: {condition.replace(/_/g, " ")} market
                                    </div>
                                    {rankings.length > 0
                                        ? <AdvisorRankings rankings={rankings} condition={condition} />
                                        : <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading advisor rankings...</div>
                                    }
                                </div>
                            )}

                            {/* ── RISK ALERTS ───────────────────────────────────────────── */}
                            {tab === "alerts" && (
                                <div>
                                    <div style={{ marginBottom: 14, fontSize: 11, color: "#546e7a" }}>
                                        Alerts are generated when your advisor's strategy does not match current market conditions.
                                    </div>
                                    <RiskAlerts alerts={alerts} />
                                </div>
                            )}

                            {/* ── OPPORTUNITY SCANNER ───────────────────────────────────── */}
                            {tab === "signals" && (
                                <div>
                                    <div style={{ marginBottom: 14, fontSize: 11, color: "#546e7a" }}>
                                        {signals.length} active signal{signals.length !== 1 ? "s" : ""} detected · Updated every 60 seconds
                                    </div>
                                    {signals.length > 0
                                        ? <OpportunityFeed signals={signals} />
                                        : <GC style={{ padding: 40, textAlign: "center" }}><div style={{ color: "#546e7a" }}>No high-confidence signals at this time. Market data is being analyzed...</div></GC>
                                    }
                                </div>
                            )}

                            {/* ── AI BRIEFING ───────────────────────────────────────────── */}
                            {tab === "briefing" && (
                                summaryLoading
                                    ? <div style={{ textAlign: "center", padding: 80, color: "#7c4dff" }}>🤖 Generating AI market intelligence briefing...</div>
                                    : summary
                                        ? <DailyBriefing summary={summary} />
                                        : <GC style={{ padding: 40, textAlign: "center" }}><div style={{ color: "#546e7a" }}>Unable to generate briefing. Check AI API key configuration.</div></GC>
                            )}

                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
