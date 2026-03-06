"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────
interface InvestorProfile { investorType: string; riskCategory: string; capitalRange: string; maxDrawdownTolerance: string; preferredStrategy: string; riskScore: number; }
interface CompatibilityBreakdown { riskCompatibility: number; strategyCompatibility: number; capitalCompatibility: number; consistencyScore: number; }
interface AdvisorDNA { strategyType: string; avgHoldingDays: number; avgRiskPerTrade: number; historicalMaxDrawdown: number; avgReturnPerTrade: number; winRate: number; consistencyScore: number; capitalMin: number; capitalMax: number; totalTrades: number; }
interface MatchResult { advisorId: string; advisorName: string; sebiRegNo: string; compatibilityScore: number; breakdown: CompatibilityBreakdown; explanation: string[]; warnings: string[]; dna: AdvisorDNA; }
interface SimResult { advisorName: string; principal: number; finalValue: number; percentReturn: number; maxDrawdown: number; worstMonth: number; bestMonth: number; sharpeRatio: number; riskAdjustedNote: string; monthlyEquityCurve: { month: string; value: number; return: number }[]; }
interface TrustScore { advisorId: string; advisorName: string; overallScore: number; consistency: number; riskManagement: number; clientFeedback: number; transparency: number; badge: string; summary: string; }
interface ScamFlag { advisorId: string; advisorName: string; flagType: string; severity: string; description: string; }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("en-IN");
const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

const BADGE_COLORS: Record<string, string> = {
    Platinum: "#e5e4e2", Gold: "#ffd700", Silver: "#c0c0c0", Registered: "#90caf9",
};
const RISK_COLORS: Record<string, string> = {
    Conservative: "#00e676", Moderate: "#ffd740", Aggressive: "#ff5252",
};
const SEV_COLORS: Record<string, string> = {
    CRITICAL: "#ff5252", WARNING: "#ffd740", INFO: "#40c4ff",
};

// ─── Glass Card ──────────────────────────────────────────────────────────────
function GC({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={className} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, backdropFilter: "blur(20px)", ...style,
        }}>{children}</div>
    );
}

// ─── Mini Progress Bar ───────────────────────────────────────────────────────
function Bar({ value, max = 100, color = "#7c4dff", label }: { value: number; max?: number; color?: string; label?: string }) {
    return (
        <div style={{ marginBottom: 6 }}>
            {label && <div style={{ fontSize: 10, color: "#78909c", marginBottom: 3, fontWeight: 700 }}>{label}</div>}
            <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ height: "100%", background: color, borderRadius: 3 }} />
            </div>
        </div>
    );
}

// ─── Equity Curve SVG ───────────────────────────────────────────────────────
function EquityCurve({ data, principal }: { data: { month: string; value: number }[]; principal: number }) {
    if (!data || data.length === 0) return null;
    const W = 560, H = 140, pad = { l: 40, r: 20, t: 16, b: 28 };
    const vals = data.map(d => d.value);
    const min = Math.min(principal, ...vals), max = Math.max(principal, ...vals);
    const range = max - min || 1;
    const xStep = (W - pad.l - pad.r) / (data.length - 1);
    const y = (v: number) => pad.t + ((max - v) / range) * (H - pad.t - pad.b);
    const pts = data.map((d, i) => `${pad.l + i * xStep},${y(d.value)}`).join(" ");

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
            <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e676" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
                </linearGradient>
            </defs>
            <polyline fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1}
                points={`${pad.l},${y(principal)} ${W - pad.r},${y(principal)}`} strokeDasharray="4,4" />
            <polygon fill="url(#cg)"
                points={`${pad.l},${H - pad.b} ${pts} ${pad.l + (data.length - 1) * xStep},${H - pad.b}`} />
            <polyline fill="none" stroke="#00e676" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" points={pts} />
            {data.map((d, i) => (
                <text key={d.month} x={pad.l + i * xStep} y={H - 6} textAnchor="middle"
                    fontSize={8} fill="#546e7a" fontWeight={600}>{d.month}</text>
            ))}
        </svg>
    );
}

// ─── Monthly Return Bars ─────────────────────────────────────────────────────
function MonthlyBars({ data }: { data: { month: string; return: number }[] }) {
    if (!data || data.length === 0) return null;
    const maxAbs = Math.max(...data.map(d => Math.abs(d.return)), 0.1);
    return (
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
            {data.map(d => {
                const h = Math.round((Math.abs(d.return) / maxAbs) * 60);
                return (
                    <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <motion.div initial={{ height: 0 }} animate={{ height: h }}
                            style={{ width: "100%", background: d.return >= 0 ? "#00e676" : "#ff5252", borderRadius: 2 }} />
                        <span style={{ fontSize: 7, color: "#546e7a", fontWeight: 700 }}>{d.month.slice(0, 1)}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Compatibility Ring ──────────────────────────────────────────────────────
function CompatRing({ score }: { score: number }) {
    const r = 30, circ = 2 * Math.PI * r;
    const color = score >= 80 ? "#00e676" : score >= 65 ? "#ffd740" : "#ff5252";
    return (
        <div style={{ position: "relative", width: 80, height: 80 }}>
            <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
                <motion.circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={8}
                    strokeLinecap="round" strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - (score / 100) * circ }}
                    transition={{ duration: 1.2, ease: "easeOut" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 900, color }}>{score}%</span>
            </div>
        </div>
    );
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCard({ m, rank, onSimulate }: { m: MatchResult; rank: number; onSimulate: (m: MatchResult) => void }) {
    const [open, setOpen] = useState(rank === 1);
    const { breakdown: b } = m;
    return (
        <GC style={{ padding: "20px 22px", borderColor: rank === 1 ? "rgba(0,230,118,0.3)" : undefined }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: rank === 1 ? "#00e676" : "#546e7a", width: 28 }}>#{rank}</div>
                <CompatRing score={m.compatibilityScore} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{m.advisorName}</div>
                    <div style={{ fontSize: 10, color: "#546e7a", marginTop: 2 }}>{m.sebiRegNo} · {m.dna.strategyType}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <Pill label={`WR ${m.dna.winRate}%`} color="#00e676" />
                        <Pill label={`DD ${m.dna.historicalMaxDrawdown}%`} color="#ffd740" />
                        <Pill label={`${m.dna.totalTrades} trades`} color="#90caf9" />
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <button onClick={() => onSimulate(m)} style={btnStyle("#7c4dff")}>Simulate</button>
                    <button onClick={() => setOpen(!open)} style={btnStyle("transparent", "#546e7a")}>{open ? "Less ▲" : "More ▼"}</button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#7c4dff", marginBottom: 8 }}>COMPATIBILITY BREAKDOWN</div>
                                    <Bar value={b.riskCompatibility} max={40} color="#00e676" label={`Risk Match ${b.riskCompatibility}/40`} />
                                    <Bar value={b.strategyCompatibility} max={30} color="#ffd740" label={`Strategy ${b.strategyCompatibility}/30`} />
                                    <Bar value={b.capitalCompatibility} max={15} color="#40c4ff" label={`Capital ${b.capitalCompatibility}/15`} />
                                    <Bar value={b.consistencyScore} max={15} color="#ce93d8" label={`Consistency ${b.consistencyScore}/15`} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#00e676", marginBottom: 8 }}>WHY RECOMMENDED</div>
                                    {m.explanation.map((e, i) => (
                                        <div key={i} style={{ fontSize: 11, color: "#b0bec5", marginBottom: 5, paddingLeft: 8, borderLeft: "2px solid #00e67640" }}>✓ {e}</div>
                                    ))}
                                    {m.warnings.map((w, i) => (
                                        <div key={i} style={{ fontSize: 11, color: "#ffd740", marginBottom: 5, paddingLeft: 8, borderLeft: "2px solid #ffd74040" }}>⚠ {w}</div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                {[
                                    { label: "Avg Holding", value: `${m.dna.avgHoldingDays}d` },
                                    { label: "Avg Return/Trade", value: `${m.dna.avgReturnPerTrade}%` },
                                    { label: "Max Drawdown", value: `${m.dna.historicalMaxDrawdown}%` },
                                    { label: "Capital Range", value: `₹${(m.dna.capitalMin / 100000).toFixed(0)}L–₹${(m.dna.capitalMax / 100000).toFixed(0)}L` },
                                ].map(s => (
                                    <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                                        <div style={{ fontSize: 9, color: "#546e7a", marginTop: 2 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GC>
    );
}

function Pill({ label, color }: { label: string; color: string }) {
    return <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: `${color}15`, color }}>{label}</span>;
}
function btnStyle(bg: string, color = "#fff"): React.CSSProperties {
    return { padding: "6px 14px", borderRadius: 8, border: `1px solid ${bg === "transparent" ? "rgba(255,255,255,0.1)" : bg}`, background: bg, color, fontWeight: 700, fontSize: 11, cursor: "pointer" };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTIONNAIRE Component
// ─────────────────────────────────────────────────────────────────────────────
const Q_FIELDS = [
    { key: "capitalRange", label: "Investment Capital", options: ["1L-3L", "3L-10L", "10L-50L", "50L+"] },
    { key: "maxLossTolerance", label: "Max Loss Tolerance (%)", type: "number", placeholder: "e.g. 10" },
    { key: "investmentHorizon", label: "Investment Horizon", options: ["short", "medium", "long"] },
    { key: "tradingFrequency", label: "Trading Frequency", options: ["daily", "weekly", "monthly", "rarely"] },
    { key: "experienceLevel", label: "Experience Level", options: ["beginner", "intermediate", "advanced"] },
    { key: "emotionalTolerance", label: "Drawdown Emotional Tolerance", options: ["low", "medium", "high"] },
];

function Questionnaire({ onProfile }: { onProfile: (p: InvestorProfile) => void }) {
    const [form, setForm] = useState<Record<string, string>>({ capitalRange: "3L-10L", maxLossTolerance: "12", investmentHorizon: "medium", tradingFrequency: "weekly", experienceLevel: "intermediate", emotionalTolerance: "medium" });
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/decision-intelligence/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: "demo-user", ...form, maxLossTolerance: Number(form.maxLossTolerance) }),
            });
            const data = await res.json();
            onProfile(data.profile);
        } catch {
            onProfile({ investorType: "Moderate Swing Investor", riskCategory: "Moderate", capitalRange: form.capitalRange, maxDrawdownTolerance: `${form.maxLossTolerance}%`, preferredStrategy: "Swing / Positional", riskScore: 52 });
        } finally { setLoading(false); }
    };

    return (
        <GC style={{ padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#7c4dff", marginBottom: 20 }}>📋 Risk Profile Questionnaire</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {Q_FIELDS.map(f => (
                    <div key={f.key}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#90a4ae", display: "block", marginBottom: 6 }}>{f.label}</label>
                        {f.options ? (
                            <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12 }}>
                                {f.options.map(o => <option key={o} value={o} style={{ background: "#0B0B12" }}>{o}</option>)}
                            </select>
                        ) : (
                            <input type="number" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                placeholder={f.placeholder}
                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
                        )}
                    </div>
                ))}
            </div>
            <button onClick={submit} disabled={loading}
                style={{ ...btnStyle("linear-gradient(135deg,#7c4dff,#00e676)"), marginTop: 24, width: "100%", padding: "12px", fontSize: 13 }}>
                {loading ? "Analysing Profile..." : "Generate My Investor Profile →"}
            </button>
        </GC>
    );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ profile }: { profile: InvestorProfile }) {
    const col = RISK_COLORS[profile.riskCategory] ?? "#ffd740";
    return (
        <GC style={{ padding: "22px 24px", borderColor: `${col}30` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: col, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Your Investor Profile</div>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>{profile.investorType}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: col }}>{profile.riskScore}</div>
                    <div style={{ fontSize: 9, color: "#546e7a", fontWeight: 700 }}>RISK SCORE</div>
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16 }}>
                {[
                    { label: "Risk Category", value: profile.riskCategory },
                    { label: "Capital Range", value: `₹${profile.capitalRange}` },
                    { label: "Max Drawdown Tolerance", value: profile.maxDrawdownTolerance },
                    { label: "Preferred Strategy", value: profile.preferredStrategy },
                ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ fontSize: 9, color: "#546e7a", fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{s.value}</div>
                    </div>
                ))}
            </div>
        </GC>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_ADVISORS = ["mock-1", "mock-2", "mock-3", "mock-4"];
const TABS = [
    { id: "profile", label: "🧠 Profile" },
    { id: "matches", label: "🎯 Matches" },
    { id: "simulate", label: "📈 Simulate" },
    { id: "compare", label: "⚖️ Compare" },
    { id: "trust", label: "🛡️ Trust & Safety" },
] as const;
type Tab = typeof TABS[number]["id"];

export default function DecisionIntelligencePage() {
    const [tab, setTab] = useState<Tab>("profile");
    const [profile, setProfile] = useState<InvestorProfile | null>(null);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [matchLoading, setMatchLoading] = useState(false);
    const [simAdvisor, setSimAdvisor] = useState<MatchResult | null>(null);
    const [simPrincipal, setSimPrincipal] = useState<number>(500000);
    const [simResult, setSimResult] = useState<SimResult | null>(null);
    const [simLoading, setSimLoading] = useState(false);
    const [compareIds, setCompareIds] = useState<string[]>(["mock-1", "mock-2"]);
    const [compareData, setCompareData] = useState<any[]>([]);
    const [compareLoading, setCompareLoading] = useState(false);
    const [trustData, setTrustData] = useState<{ trustScores: TrustScore[]; flags: ScamFlag[] } | null>(null);

    // Auto-load trust data
    useEffect(() => {
        fetch("/api/decision-intelligence/flags")
            .then(r => r.json())
            .then(setTrustData)
            .catch(() => setTrustData({ trustScores: [], flags: [] }));
    }, []);

    const handleProfile = useCallback(async (p: InvestorProfile) => {
        setProfile(p);
        setTab("matches");
        setMatchLoading(true);
        try {
            const res = await fetch("/api/decision-intelligence/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profileOverride: p }),
            });
            const data = await res.json();
            setMatches(data.matches ?? []);
        } catch { setMatches([]); }
        finally { setMatchLoading(false); }
    }, []);

    const handleSimulate = useCallback(async (advisor?: MatchResult) => {
        const target = advisor ?? simAdvisor;
        if (!target) return;
        setSimAdvisor(target);
        setSimLoading(true);
        setTab("simulate");
        try {
            const res = await fetch("/api/decision-intelligence/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ advisorId: target.advisorId, principal: simPrincipal }),
            });
            const data = await res.json();
            setSimResult(data.simulation);
        } catch { setSimResult(null); }
        finally { setSimLoading(false); }
    }, [simAdvisor, simPrincipal]);

    const handleCompare = useCallback(async () => {
        setCompareLoading(true);
        try {
            const res = await fetch("/api/decision-intelligence/compare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ advisorIds: compareIds }),
            });
            const data = await res.json();
            setCompareData(data.comparison ?? []);
        } catch { setCompareData([]); }
        finally { setCompareLoading(false); }
    }, [compareIds]);

    useEffect(() => { handleCompare(); }, []);

    // ── Layout ──────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", background: "#0B0B12", color: "#fff", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Bg blobs */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 700, height: 700, background: "radial-gradient(circle,rgba(124,77,255,0.1) 0%,transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, width: 500, height: 500, background: "radial-gradient(circle,rgba(0,230,118,0.06) 0%,transparent 70%)" }} />
            </div>

            <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#7c4dff,#00e676)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 0 30px rgba(124,77,255,0.4)" }}>🧠</div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Decision Intelligence System</h1>
                            <p style={{ margin: 0, fontSize: 12, color: "#546e7a", marginTop: 4 }}>India's most transparent advisor selection engine — powered by real performance data</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{
                                padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                                background: tab === t.id ? "linear-gradient(135deg,#7c4dff,#00e676)" : "rgba(255,255,255,0.05)",
                                color: tab === t.id ? "#fff" : "#546e7a", transition: "all 0.2s"
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

                        {/* ── TAB: PROFILE ─────────────────────────────────────────────── */}
                        {tab === "profile" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <Questionnaire onProfile={handleProfile} />
                                {profile && <ProfileCard profile={profile} />}
                            </div>
                        )}

                        {/* ── TAB: MATCHES ─────────────────────────────────────────────── */}
                        {tab === "matches" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {profile && <ProfileCard profile={profile} />}
                                {!profile && (
                                    <GC style={{ padding: 24, textAlign: "center" }}>
                                        <div style={{ color: "#546e7a", marginBottom: 12 }}>Complete your risk profile first to see personalised matches.</div>
                                        <button onClick={() => setTab("profile")} style={btnStyle("linear-gradient(135deg,#7c4dff,#00e676)")}>Go to Profile →</button>
                                    </GC>
                                )}
                                {matchLoading && <div style={{ textAlign: "center", padding: 40, color: "#546e7a" }}>⚙️ Analysing advisor compatibility...</div>}
                                {!matchLoading && matches.length > 0 && (
                                    <>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: "#7c4dff", letterSpacing: 1 }}>TOP ADVISOR MATCHES FOR YOUR PROFILE</div>
                                        {matches.map((m, i) => <MatchCard key={m.advisorId} m={m} rank={i + 1} onSimulate={handleSimulate} />)}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ── TAB: SIMULATE ────────────────────────────────────────────── */}
                        {tab === "simulate" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <GC style={{ padding: 24 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: "#7c4dff", marginBottom: 16 }}>📈 Risk Simulation — 12-Month Historical Backtest</div>
                                    <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                                        <div style={{ flex: 1, minWidth: 200 }}>
                                            <label style={{ fontSize: 11, fontWeight: 700, color: "#90a4ae", display: "block", marginBottom: 6 }}>Select Advisor</label>
                                            <select value={simAdvisor?.advisorId ?? "mock-1"}
                                                onChange={e => { const found = matches.find(m => m.advisorId === e.target.value); setSimAdvisor(found ?? { advisorId: e.target.value, advisorName: e.target.options[e.target.selectedIndex].text } as any); }}
                                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 12 }}>
                                                {matches.length > 0
                                                    ? matches.map(m => <option key={m.advisorId} value={m.advisorId} style={{ background: "#0B0B12" }}>{m.advisorName}</option>)
                                                    : MOCK_ADVISORS.map(id => <option key={id} value={id} style={{ background: "#0B0B12" }}>{id}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 11, fontWeight: 700, color: "#90a4ae", display: "block", marginBottom: 6 }}>Principal (₹)</label>
                                            <input type="number" value={simPrincipal} onChange={e => setSimPrincipal(Number(e.target.value))}
                                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 12, width: 160 }} />
                                        </div>
                                        <button onClick={() => handleSimulate()} disabled={simLoading} style={btnStyle("linear-gradient(135deg,#7c4dff,#00e676)", "#fff")}>
                                            {simLoading ? "Running..." : "Run Simulation →"}
                                        </button>
                                    </div>
                                </GC>

                                {simResult && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        {/* KPI Row */}
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
                                            {[
                                                { label: "Investment", value: `₹${fmt(simResult.principal)}`, color: "#90caf9" },
                                                { label: "Final Value", value: `₹${fmt(simResult.finalValue)}`, color: simResult.finalValue >= simResult.principal ? "#00e676" : "#ff5252" },
                                                { label: "Total Return", value: pct(simResult.percentReturn), color: simResult.percentReturn >= 0 ? "#00e676" : "#ff5252" },
                                                { label: "Max Drawdown", value: `-${simResult.maxDrawdown}%`, color: "#ffd740" },
                                                { label: "Best Month", value: pct(simResult.bestMonth), color: "#00e676" },
                                                { label: "Worst Month", value: pct(simResult.worstMonth), color: "#ff5252" },
                                                { label: "Sharpe Ratio", value: simResult.sharpeRatio.toFixed(2), color: simResult.sharpeRatio > 1 ? "#00e676" : "#ffd740" },
                                            ].map(k => (
                                                <GC key={k.label} style={{ padding: "14px 16px", textAlign: "center" }}>
                                                    <div style={{ fontSize: 18, fontWeight: 900, color: k.color }}>{k.value}</div>
                                                    <div style={{ fontSize: 9, color: "#546e7a", fontWeight: 700, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>{k.label}</div>
                                                </GC>
                                            ))}
                                        </div>

                                        {/* Charts */}
                                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                                            <GC style={{ padding: 20 }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: "#00e676", marginBottom: 12 }}>EQUITY CURVE</div>
                                                <EquityCurve data={simResult.monthlyEquityCurve} principal={simResult.principal} />
                                            </GC>
                                            <GC style={{ padding: 20 }}>
                                                <div style={{ fontSize: 11, fontWeight: 800, color: "#ffd740", marginBottom: 12 }}>MONTHLY RETURNS</div>
                                                <MonthlyBars data={simResult.monthlyEquityCurve} />
                                                <div style={{ fontSize: 10, color: "#546e7a", marginTop: 12, lineHeight: 1.6 }}>{simResult.riskAdjustedNote}</div>
                                            </GC>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* ── TAB: COMPARE ─────────────────────────────────────────────── */}
                        {tab === "compare" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <GC style={{ padding: 22 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: "#7c4dff", marginBottom: 14 }}>⚖️ Advisor Comparison</div>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                        {MOCK_ADVISORS.map(id => (
                                            <label key={id} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, color: compareIds.includes(id) ? "#fff" : "#546e7a" }}>
                                                <input type="checkbox" checked={compareIds.includes(id)}
                                                    onChange={e => setCompareIds(prev => e.target.checked ? [...prev, id] : prev.filter(x => x !== id))}
                                                    style={{ accentColor: "#7c4dff" }} />
                                                {id}
                                            </label>
                                        ))}
                                        <button onClick={handleCompare} disabled={compareLoading} style={{ ...btnStyle("linear-gradient(135deg,#7c4dff,#00e676)"), marginLeft: "auto" }}>
                                            {compareLoading ? "Comparing..." : "Compare →"}
                                        </button>
                                    </div>
                                </GC>

                                {compareData.length > 0 && (
                                    <GC style={{ padding: 0, overflow: "hidden" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <thead>
                                                <tr style={{ background: "rgba(124,77,255,0.1)" }}>
                                                    <th style={th()}>Metric</th>
                                                    {compareData.map(d => <th key={d.advisorId} style={th()}>{d.advisorName}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { key: "strategyType", label: "Strategy" },
                                                    { key: "winRate", label: "Win Rate", suffix: "%" },
                                                    { key: "avgReturn", label: "Avg Return/Trade", suffix: "%" },
                                                    { key: "maxDrawdown", label: "Max Drawdown", suffix: "%" },
                                                    { key: "consistencyScore", label: "Consistency", suffix: "/100" },
                                                    { key: "trustScore", label: "Trust Score", suffix: "/10" },
                                                    { key: "totalTrades", label: "Total Trades" },
                                                    { key: "profitFactor", label: "Profit Factor" },
                                                    { key: "capitalRange", label: "Capital Range" },
                                                ].map((row, ri) => (
                                                    <tr key={row.key} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                                                        <td style={td(true)}>{row.label}</td>
                                                        {compareData.map(d => {
                                                            const val = d[row.key];
                                                            const isNum = typeof val === "number";
                                                            const best = isNum ? Math.max(...compareData.map((x: any) => x[row.key])) : null;
                                                            const isBest = isNum && val === best && ["winRate", "avgReturn", "consistencyScore", "trustScore", "profitFactor"].includes(row.key);
                                                            const isWorst = isNum && row.key === "maxDrawdown" && val === Math.min(...compareData.map((x: any) => x[row.key]));
                                                            return <td key={d.advisorId} style={{ ...td(), color: (isBest || isWorst) ? "#00e676" : "#eceff1", fontWeight: (isBest || isWorst) ? 800 : 400 }}>
                                                                {isNum ? `${val}${row.suffix ?? ""}` : val}
                                                                {(isBest || isWorst) && " ★"}
                                                            </td>;
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </GC>
                                )}
                            </div>
                        )}

                        {/* ── TAB: TRUST & SAFETY ──────────────────────────────────────── */}
                        {tab === "trust" && trustData && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
                                    {trustData.trustScores.map(t => (
                                        <GC key={t.advisorId} style={{ padding: "20px 22px", borderColor: `${BADGE_COLORS[t.badge] ?? "#90caf9"}30` }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 800 }}>{t.advisorName}</div>
                                                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: `${BADGE_COLORS[t.badge]}20`, color: BADGE_COLORS[t.badge] }}>{t.badge}</span>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: 28, fontWeight: 900, color: t.overallScore >= 9 ? "#00e676" : t.overallScore >= 7 ? "#ffd740" : "#ff5252" }}>{t.overallScore}</div>
                                                    <div style={{ fontSize: 8, color: "#546e7a", fontWeight: 700 }}>/ 10</div>
                                                </div>
                                            </div>
                                            <Bar value={t.consistency} max={10} color="#00e676" label={`Consistency ${t.consistency}/10`} />
                                            <Bar value={t.riskManagement} max={10} color="#ffd740" label={`Risk Management ${t.riskManagement}/10`} />
                                            <Bar value={t.clientFeedback} max={10} color="#40c4ff" label={`Client Feedback ${t.clientFeedback}/10`} />
                                            <Bar value={t.transparency} max={10} color="#ce93d8" label={`Transparency ${t.transparency}/10`} />
                                            <div style={{ fontSize: 10, color: "#78909c", marginTop: 10, lineHeight: 1.6 }}>{t.summary}</div>
                                        </GC>
                                    ))}
                                </div>

                                {/* Scam Flags */}
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: "#ff5252", marginBottom: 14, letterSpacing: 1 }}>
                                        🚨 SCAM DETECTION ALERTS ({trustData.flags.length} flag{trustData.flags.length !== 1 ? "s" : ""})
                                    </div>
                                    {trustData.flags.length === 0 ? (
                                        <GC style={{ padding: 24, textAlign: "center", borderColor: "rgba(0,230,118,0.2)" }}>
                                            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                                            <div style={{ color: "#00e676", fontWeight: 700 }}>No scam flags detected across all advisors.</div>
                                        </GC>
                                    ) : (
                                        trustData.flags.map(f => (
                                            <GC key={f.advisorId + f.flagType} style={{ padding: "16px 20px", marginBottom: 10, borderColor: `${SEV_COLORS[f.severity]}30` }}>
                                                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                                    <span style={{ fontSize: 20 }}>{f.severity === "CRITICAL" ? "🚨" : "⚠️"}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                                                            <span style={{ fontSize: 12, fontWeight: 800 }}>{f.advisorName}</span>
                                                            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: `${SEV_COLORS[f.severity]}15`, color: SEV_COLORS[f.severity] }}>{f.severity}</span>
                                                            <span style={{ fontSize: 9, color: "#546e7a" }}>{f.flagType.replace(/_/g, " ")}</span>
                                                        </div>
                                                        <div style={{ fontSize: 12, color: "#b0bec5", lineHeight: 1.6 }}>{f.description}</div>
                                                    </div>
                                                </div>
                                            </GC>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function th(): React.CSSProperties {
    return { padding: "12px 16px", fontSize: 11, fontWeight: 800, color: "#90a4ae", textAlign: "left", letterSpacing: 0.5, borderBottom: "1px solid rgba(255,255,255,0.07)" };
}
function td(bold = false): React.CSSProperties {
    return { padding: "11px 16px", fontSize: 12, fontWeight: bold ? 700 : 400, color: bold ? "#fff" : "#90a4ae", borderBottom: "1px solid rgba(255,255,255,0.04)" };
}
