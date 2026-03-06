"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Advisor { advisorId: string; name: string; sebiRegNo: string; strategyType: string; compatibilityScore: number; trustScore: number; marketFitScore: number; compositeScore: number; verificationBadge: string; winRate: number; maxDrawdown: number; isTopPick: boolean; matchReasons: string[]; }
interface LedgerEntry { year: number; winRate: number; maxDrawdown: number; avgMonthlyReturn: number; strategyType: string; trustScore: number; totalTrades: number; verified: boolean; }
interface LedgerSummary { advisorId: string; totalYears: number; avgWinRate: number; bestYear: number; worstDrawdown: number; strategyEvolution: string[]; isIntegrityValid: boolean; entries: LedgerEntry[]; }
interface Achievement { id: string; label: string; icon: string; xpReward: number; earnedAt?: string; }
interface Journey { stage: string; xp: number; xpToNextStage: number; stageProgress: number; achievements: Achievement[]; nextMilestone: string; stageBenefits: string[]; stageColor: string; }
interface StrategyRank { rank: number; strategyType: string; score: number; trend: string; label: string; advisorCount: number; avgWinRate: number; marketConditionFit: string; icon: string; color: string; }
interface MomentumAdvisor { advisorId: string; name: string; strategyType: string; trustDelta: number; currentScore: number; badge: string; }
interface Post { id: string; authorId: string; authorType: string; authorName: string; content: string; tags: string[]; likes: number; isScamFlagged: boolean; aiRiskScore: number; riskLabel: string; createdAt: string; }
interface ReferralInfo { code: string; totalReferrals: number; xpEarned: number; shareUrl: string; recentReferrals: { userId: string; joinedAt: string }[]; }
interface NetworkStats { totalReferrals: number; thisMonthReferrals: number; conversionRate: number; topReferrers: { name: string; count: number }[]; }
interface GrowthTrend { label: string; value: number; delta: number; deltaLabel: string; color: string; icon: string; }
interface EcosystemSnapshot { totalInvestors: number; totalAdvisors: number; verifiedAdvisors: number; totalVerifiedTrades: number; avgTrustScore: number; totalCommunityPosts: number; investorSuccessRate: number; platformHealthScore: number; }

// ─── Shared UI ────────────────────────────────────────────────────────────────
function GC({ children, style = {}, glow = "" }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
    return <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${glow || "rgba(255,255,255,0.08)"}`, borderRadius: 16, backdropFilter: "blur(16px)", boxShadow: glow ? `0 0 24px ${glow}28` : "none", ...style }}>{children}</div>;
}
function Tag({ label, color }: { label: string; color: string }) {
    return <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 5, background: `${color}18`, color, border: `1px solid ${color}30`, whiteSpace: "nowrap" }}>{label}</span>;
}
function Bar({ value, color, max = 100 }: { value: number; color: string; max?: number }) {
    return <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (value / max) * 100)}%` }} transition={{ duration: 0.85 }} style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${color}80,${color})` }} />
    </div>;
}
const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

// ─── TAB 1 — Discover ─────────────────────────────────────────────────────────
function DiscoverTab({ advisors }: { advisors: Advisor[] }) {
    const [filter, setFilter] = useState("");
    const filtered = filter ? advisors.filter(a => a.strategyType === filter) : advisors;
    const strategies = ["INTRADAY", "SWING", "POSITIONAL", "OPTIONS", "MOMENTUM"];
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setFilter("")} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 10, background: !filter ? "linear-gradient(135deg,#7C4DFF,#00E5FF)" : "rgba(255,255,255,0.05)", color: !filter ? "#fff" : "#546e7a" }}>All</button>
                {strategies.map(s => <button key={s} onClick={() => setFilter(s)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 10, background: filter === s ? "linear-gradient(135deg,#7C4DFF,#00E5FF)" : "rgba(255,255,255,0.05)", color: filter === s ? "#fff" : "#546e7a" }}>{s}</button>)}
            </div>
            {filtered.map((a, i) => {
                const bc = a.verificationBadge === "PLATINUM" ? "#E5E4E2" : a.verificationBadge === "GOLD" ? "#FFD700" : "#90a4ae";
                return (
                    <motion.div key={a.advisorId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <GC glow={a.isTopPick ? "#7C4DFF" : ""} style={{ padding: "18px 20px" }}>
                            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                <div style={{ width: 46, height: 46, borderRadius: 12, background: `${bc}16`, border: `1.5px solid ${bc}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{a.verificationBadge === "PLATINUM" ? "💎" : a.verificationBadge === "GOLD" ? "🥇" : "🏅"}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 5 }}>
                                        <span style={{ fontWeight: 900, fontSize: 14 }}>{a.name}</span>
                                        <Tag label={a.verificationBadge} color={bc} />
                                        <Tag label={a.strategyType} color="#7C4DFF" />
                                        {a.isTopPick && <Tag label="⭐ TOP PICK" color="#00E676" />}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#546e7a", marginBottom: 10 }}>{a.sebiRegNo}</div>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {a.matchReasons.slice(0, 2).map(r => <div key={r} style={{ fontSize: 10, color: "#90a4ae", padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>✓ {r}</div>)}
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "right", flexShrink: 0 }}>
                                    <div><div style={{ fontSize: 22, fontWeight: 900, color: "#7C4DFF" }}>{a.compositeScore}</div><div style={{ fontSize: 9, color: "#546e7a", fontWeight: 700 }}>MATCH</div></div>
                                    <div><div style={{ fontSize: 13, fontWeight: 800, color: "#00E676" }}>{a.winRate}%</div><div style={{ fontSize: 9, color: "#546e7a" }}>WIN RATE</div></div>
                                    <div><div style={{ fontSize: 12, fontWeight: 800, color: a.maxDrawdown < 10 ? "#00E676" : "#FFD740" }}>{a.maxDrawdown}%</div><div style={{ fontSize: 9, color: "#546e7a" }}>MAX DD</div></div>
                                </div>
                            </div>
                            <div style={{ marginTop: 12 }}><Bar value={a.compositeScore} color="#7C4DFF" /></div>
                        </GC>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── TAB 2 — Reputation Ledger ────────────────────────────────────────────────
function ReputationTab({ ledger }: { ledger: LedgerSummary | null }) {
    if (!ledger) return <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading...</div>;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {[
                    { l: "Years on Record", v: ledger.totalYears, c: "#7C4DFF" },
                    { l: "Avg Win Rate", v: `${ledger.avgWinRate}%`, c: "#00E676" },
                    { l: "Best Year", v: ledger.bestYear, c: "#FFD740" },
                    { l: "Max Drawdown", v: `${ledger.worstDrawdown}%`, c: "#FF9800" },
                ].map(({ l, v, c }) => <GC key={l} style={{ padding: "14px 12px", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 9, color: "#546e7a", marginTop: 4, fontWeight: 700 }}>{l}</div></GC>)}
            </div>
            <GC style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{ledger.isIntegrityValid ? "🔒" : "⚠️"}</span>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: ledger.isIntegrityValid ? "#00E676" : "#FF5252" }}>
                            {ledger.isIntegrityValid ? "Integrity Verified — No tampering detected" : "Integrity Warning — Record may have been altered"}
                        </div>
                        <div style={{ fontSize: 10, color: "#546e7a", marginTop: 2 }}>SHA-256 hash validation across {ledger.totalYears} yearly records</div>
                    </div>
                </div>
            </GC>
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 16 }}>📜 Yearly Performance Ledger</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {ledger.entries.map((e, i) => (
                        <motion.div key={e.year} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 1fr 60px", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", alignItems: "center" }}>
                                <div style={{ fontWeight: 900, fontSize: 14, color: "#7C4DFF" }}>{e.year}</div>
                                <div><div style={{ fontSize: 10, color: "#546e7a" }}>Win Rate</div><div style={{ fontWeight: 800, fontSize: 13, color: "#00E676" }}>{e.winRate}%</div></div>
                                <div><div style={{ fontSize: 10, color: "#546e7a" }}>Max DD</div><div style={{ fontWeight: 800, fontSize: 13, color: "#FF9800" }}>{e.maxDrawdown}%</div></div>
                                <div><div style={{ fontSize: 10, color: "#546e7a" }}>Avg Return</div><div style={{ fontWeight: 800, fontSize: 13, color: "#FFD740" }}>{e.avgMonthlyReturn}%/mo</div></div>
                                <div><div style={{ fontSize: 10, color: "#546e7a" }}>Strategy</div><div style={{ fontWeight: 700, fontSize: 11, color: "#B388FF" }}>{e.strategyType}</div></div>
                                <div style={{ textAlign: "right" }}>{e.verified ? <span style={{ color: "#00E676", fontSize: 14 }}>✓</span> : <span style={{ color: "#FF5252", fontSize: 14 }}>✗</span>}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </GC>
        </div>
    );
}

// ─── TAB 3 — Journey ─────────────────────────────────────────────────────────
function JourneyTab({ journey }: { journey: Journey | null }) {
    if (!journey) return <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading...</div>;
    const c = journey.stageColor;
    const STAGES = ["BEGINNER", "LEARNER", "SIMULATOR", "ACTIVE", "ADVANCED"];
    const STAGE_ICONS: Record<string, string> = { BEGINNER: "🌱", LEARNER: "📚", SIMULATOR: "🎯", ACTIVE: "💸", ADVANCED: "🏆" };
    const stageIdx = STAGES.indexOf(journey.stage);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GC glow={c} style={{ padding: "28px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>{STAGE_ICONS[journey.stage]}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: c, marginTop: 8 }}>{journey.stage}</div>
                <div style={{ fontSize: 13, color: "#546e7a", marginTop: 4 }}>{journey.xp.toLocaleString()} XP · {journey.xpToNextStage > 0 ? `${journey.xpToNextStage} XP to next stage` : "Max stage reached"}</div>
                <div style={{ margin: "16px 0 8px" }}><Bar value={journey.stageProgress} color={c} /></div>
                <div style={{ fontSize: 11, color: "#78909c", lineHeight: 1.6 }}>{journey.nextMilestone}</div>
            </GC>
            {/* Stage road */}
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>🗺️ Your Path</div>
                <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
                    {STAGES.map((s, i) => {
                        const done = i < stageIdx; const current = i === stageIdx;
                        const sc = { BEGINNER: "#78909c", LEARNER: "#7C4DFF", SIMULATOR: "#00E5FF", ACTIVE: "#FFD740", ADVANCED: "#00E676" }[s] ?? "#546e7a";
                        return (
                            <React.Fragment key={s}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: done ? `${sc}30` : current ? `${sc}20` : "rgba(255,255,255,0.04)", border: `2px solid ${done || current ? sc : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, margin: "0 auto 6px" }}>{done ? "✅" : STAGE_ICONS[s]}</div>
                                    <div style={{ fontSize: 8, fontWeight: 700, color: current ? sc : "#546e7a", whiteSpace: "nowrap" }}>{s}</div>
                                </div>
                                {i < STAGES.length - 1 && <div style={{ flex: 1, height: 2, background: i < stageIdx ? "#00E676" : "rgba(255,255,255,0.06)", margin: "0 4px 20px" }} />}
                            </React.Fragment>
                        );
                    })}
                </div>
            </GC>
            {/* Achievements */}
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>🏅 Achievements</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {journey.achievements.map(a => (
                        <div key={a.id} style={{ padding: "12px 10px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                            <div style={{ fontSize: 22 }}>{a.icon}</div>
                            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 6, color: "#b0bec5" }}>{a.label}</div>
                            <div style={{ fontSize: 9, color: "#00E676", marginTop: 3 }}>+{a.xpReward} XP</div>
                        </div>
                    ))}
                </div>
            </GC>
            {/* Stage benefits */}
            <GC style={{ padding: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, color: c }}>✨ {journey.stage} Benefits</div>
                {journey.stageBenefits.map(b => <div key={b} style={{ fontSize: 11, color: "#90a4ae", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>✓ {b}</div>)}
            </GC>
        </div>
    );
}

// ─── TAB 4 — Strategy Intel ────────────────────────────────────────────────────
function StrategyIntelTab({ rankings, momentum, condition }: { rankings: StrategyRank[]; momentum: MomentumAdvisor[]; condition: string }) {
    const TREND_COLORS: Record<string, string> = { HOT: "#FF5252", RISING: "#FF9800", STABLE: "#FFD740", COOLING: "#78909c", WEAK: "#546e7a" };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GC style={{ padding: "10px 16px" }}>
                <span style={{ fontSize: 12, color: "#FFD740", fontWeight: 700 }}>⚡ Market Condition: {condition.replace("_", " ")}</span>
            </GC>
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>📈 Strategy Rankings</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {rankings.map((r, i) => {
                        const tc = TREND_COLORS[r.trend] ?? "#546e7a";
                        return (
                            <motion.div key={r.strategyType} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                                <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: `1px solid ${r.rank <= 2 ? tc + "30" : "rgba(255,255,255,0.06)"}` }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${tc}18`, border: `1px solid ${tc}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{r.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                                            <span style={{ fontWeight: 800, fontSize: 13 }}>#{r.rank} {r.label}</span>
                                            <Tag label={r.trend} color={tc} />
                                        </div>
                                        <div style={{ fontSize: 10, color: "#546e7a" }}>{r.marketConditionFit}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 20, fontWeight: 900, color: tc }}>{r.score}</div>
                                        <div style={{ fontSize: 9, color: "#546e7a" }}>score</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </GC>
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>🚀 Momentum Advisors</div>
                {momentum.map((m, i) => (
                    <motion.div key={m.advisorId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <div><div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div><div style={{ fontSize: 10, color: "#546e7a", marginTop: 2 }}>{m.strategyType} · {m.badge}</div></div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 900, fontSize: 14, color: "#00E676" }}>+{m.trustDelta} pts</div>
                                <div style={{ fontSize: 10, color: "#546e7a" }}>{m.currentScore}/100 trust</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </GC>
        </div>
    );
}

// ─── TAB 5 — Community ────────────────────────────────────────────────────────
function CommunityTab({ posts }: { posts: Post[] }) {
    const [newPost, setNewPost] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [localPosts, setLocalPosts] = useState<Post[]>(posts);

    const RISK_COLORS: Record<string, string> = { SAFE: "#00E676", CAUTION: "#FFD740", HIGH_RISK: "#FF5252" };

    const submit = async () => {
        if (!newPost.trim()) return;
        setSubmitting(true);
        const res = await fetch("/api/ecosystem/community", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authorId: "mock-user", authorType: "INVESTOR", authorName: "You", content: newPost, tags: [] }),
        });
        const { post } = await res.json();
        setLocalPosts([post, ...localPosts]);
        setNewPost("");
        setSubmitting(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GC style={{ padding: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>✍️ Ask a Question</div>
                <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Ask advisors a strategy or market question..." rows={3}
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                <button onClick={submit} disabled={submitting || !newPost.trim()}
                    style={{ marginTop: 10, padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg,#7C4DFF,#00E5FF)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 12, opacity: submitting || !newPost.trim() ? 0.5 : 1 }}>
                    {submitting ? "Posting..." : "📤 Post Question"}
                </button>
            </GC>
            {localPosts.map((p, i) => {
                const rc = RISK_COLORS[p.riskLabel] ?? "#546e7a";
                return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <GC glow={p.riskLabel === "HIGH_RISK" ? "#FF5252" : ""} style={{ padding: "16px 18px" }}>
                            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, background: p.authorType === "ADVISOR" ? "rgba(0,230,118,0.12)" : "rgba(124,77,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{p.authorType === "ADVISOR" ? "👨‍💼" : "👤"}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                        <span style={{ fontWeight: 800, fontSize: 12 }}>{p.authorName}</span>
                                        <Tag label={p.authorType} color={p.authorType === "ADVISOR" ? "#00E676" : "#7C4DFF"} />
                                        {p.riskLabel !== "SAFE" && <Tag label={`⚠️ ${p.riskLabel.replace("_", " ")}`} color={rc} />}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#546e7a", marginTop: 1 }}>{new Date(p.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                                </div>
                                <div style={{ fontSize: 11, color: "#546e7a" }}>❤️ {p.likes}</div>
                            </div>
                            <div style={{ fontSize: 12, color: "#b0bec5", lineHeight: 1.7 }}>{p.content}</div>
                            {p.tags.length > 0 && <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>{p.tags.map(t => <Tag key={t} label={`#${t}`} color="#546e7a" />)}</div>}
                        </GC>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ─── TAB 6 — Referral ─────────────────────────────────────────────────────────
function ReferralTab({ referral, network }: { referral: ReferralInfo | null; network: NetworkStats | null }) {
    const [copied, setCopied] = useState(false);
    if (!referral) return <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading...</div>;
    const copy = () => { navigator.clipboard.writeText(referral.code || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GC glow="#7C4DFF" style={{ padding: "28px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#546e7a", fontWeight: 700, marginBottom: 8 }}>YOUR REFERRAL CODE</div>
                <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 8, color: "#fff", background: "rgba(124,77,255,0.12)", padding: "16px 24px", borderRadius: 14, border: "1px solid rgba(124,77,255,0.3)", display: "inline-block" }}>{referral.code}</div>
                <div style={{ marginTop: 14, fontSize: 12, color: "#546e7a" }}>Share: <span style={{ color: "#7C4DFF" }}>{referral.shareUrl}</span></div>
                <button onClick={copy} style={{ marginTop: 12, padding: "10px 24px", borderRadius: 10, background: copied ? "rgba(0,230,118,0.15)" : "rgba(124,77,255,0.2)", border: `1px solid ${copied ? "#00E676" : "#7C4DFF"}`, color: copied ? "#00E676" : "#B388FF", fontWeight: 800, cursor: "pointer", fontSize: 11 }}>
                    {copied ? "✅ Copied!" : "📋 Copy Code"}
                </button>
            </GC>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                    { l: "Total Referrals", v: referral.totalReferrals, c: "#00E676" },
                    { l: "XP Earned", v: `${referral.xpEarned}`, c: "#7C4DFF" },
                    { l: "Platform Total", v: network?.totalReferrals ?? 0, c: "#FFD740" },
                ].map(({ l, v, c }) => <GC key={l} style={{ padding: "14px", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 9, color: "#546e7a", marginTop: 4, fontWeight: 700 }}>{l}</div></GC>)}
            </div>
            {network && (
                <GC style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>🏆 Top Referrers This Month</div>
                    {network.topReferrers.map((r, i) => (
                        <div key={r.name} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <span style={{ fontSize: 14 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                                <span style={{ fontSize: 12, fontWeight: 700 }}>{r.name}</span>
                            </div>
                            <span style={{ fontWeight: 900, color: "#00E676" }}>{r.count} referrals</span>
                        </div>
                    ))}
                </GC>
            )}
        </div>
    );
}

// ─── TAB 7 — Ecosystem Metrics ────────────────────────────────────────────────
function MetricsTab({ snapshot, trends }: { snapshot: EcosystemSnapshot | null; trends: GrowthTrend[] }) {
    if (!snapshot) return <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading...</div>;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {trends.slice(0, 6).map(({ label, value, delta, deltaLabel, color, icon }) => (
                    <GC key={label} style={{ padding: "18px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color }}>{typeof value === "number" && value > 999 ? fmt(value) : value}</div>
                        <div style={{ fontSize: 9, color: "#546e7a", marginTop: 4, fontWeight: 700 }}>{label}</div>
                        <div style={{ fontSize: 9, color: "#00E676", marginTop: 4 }}>▲ {deltaLabel}</div>
                    </GC>
                ))}
            </div>
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 16 }}>📊 Platform Health</div>
                {[
                    { l: "Investor Success Rate", v: snapshot.investorSuccessRate, c: "#00E676" },
                    { l: "Platform Health Score", v: snapshot.platformHealthScore, c: "#7C4DFF" },
                    { l: "Avg Advisor Trust Score", v: snapshot.avgTrustScore, c: "#FFD740" },
                    { l: "Verified Advisors %", v: Math.round((snapshot.verifiedAdvisors / snapshot.totalAdvisors) * 100), c: "#00E5FF" },
                ].map(({ l, v, c }) => (
                    <div key={l} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 11, color: "#90a4ae" }}>{l}</span>
                            <span style={{ fontSize: 12, fontWeight: 800, color: c }}>{v}%</span>
                        </div>
                        <Bar value={v} color={c} />
                    </div>
                ))}
            </GC>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const TABS = [
    { id: "discover", label: "🔍 Discover", desc: "Find Advisors" },
    { id: "reputation", label: "📜 Reputation", desc: "Performance Ledger" },
    { id: "journey", label: "🚀 My Journey", desc: "Investor Stage" },
    { id: "strategy", label: "📈 Strategy Intel", desc: "Market Fit" },
    { id: "community", label: "💬 Community", desc: "Discussion" },
    { id: "referral", label: "🎁 Referral", desc: "Network Growth" },
    { id: "metrics", label: "📊 Metrics", desc: "Platform Stats" },
] as const;
type Tab = typeof TABS[number]["id"];

export default function EcosystemPage() {
    const [tab, setTab] = useState<Tab>("discover");
    const [loading, setLoading] = useState(true);
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [ledger, setLedger] = useState<LedgerSummary | null>(null);
    const [journey, setJourney] = useState<Journey | null>(null);
    const [stratRankings, setStratRankings] = useState<StrategyRank[]>([]);
    const [momentum, setMomentum] = useState<MomentumAdvisor[]>([]);
    const [stratCondition, setStratCondition] = useState("HIGH_VOLATILITY");
    const [posts, setPosts] = useState<Post[]>([]);
    const [referral, setReferral] = useState<ReferralInfo | null>(null);
    const [network, setNetwork] = useState<NetworkStats | null>(null);
    const [snapshot, setSnapshot] = useState<EcosystemSnapshot | null>(null);
    const [trends, setTrends] = useState<GrowthTrend[]>([]);

    const loadAll = useCallback(async () => {
        const [discRes, repRes, jrnRes, strtRes, cmRes, refRes, mtrRes] = await Promise.all([
            fetch("/api/ecosystem/discover?userId=mock-user"),
            fetch("/api/ecosystem/reputation?advisorId=eco-adv-1"),
            fetch("/api/ecosystem/journey?userId=mock-user"),
            fetch("/api/ecosystem/strategy-intel"),
            fetch("/api/ecosystem/community"),
            fetch("/api/ecosystem/referral?userId=mock-user"),
            fetch("/api/ecosystem/metrics"),
        ]);
        const [disc, rep, jrn, strt, cm, ref, mtr] = await Promise.all([
            discRes.json(), repRes.json(), jrnRes.json(), strtRes.json(), cmRes.json(), refRes.json(), mtrRes.json(),
        ]);
        setAdvisors(disc.advisors ?? []);
        setLedger(rep.summary ?? null);
        setJourney(jrn.journey ?? null);
        setStratRankings(strt.rankings ?? []);
        setMomentum(strt.momentumAdvisors ?? []);
        setStratCondition(strt.marketCondition ?? "HIGH_VOLATILITY");
        setPosts(cm.posts ?? []);
        setReferral(ref.referral ?? null);
        setNetwork(ref.network ?? null);
        setSnapshot(mtr.snapshot ?? null);
        setTrends(mtr.trends ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    if (loading) {
        return <div style={{ minHeight: "100vh", background: "#0B0B12", display: "flex", alignItems: "center", justifyContent: "center", color: "#546e7a" }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 16 }}>🌐</div><div>Loading Ecosystem...</div></div>
        </div>;
    }

    const QUICK_LINKS = [
        { label: "Market Intelligence", icon: "⚡", href: "/market-intelligence", color: "#FFD740" },
        { label: "Decision Intelligence", icon: "🧠", href: "/decision-intelligence", color: "#7C4DFF" },
        { label: "Trust Recovery", icon: "🛡️", href: "/trust-recovery", color: "#00E676" },
        { label: "Portfolio", icon: "📁", href: "/investor/portfolio", color: "#00E5FF" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#0B0B12", color: "#fff", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Ambient */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: 0, left: "30%", width: 700, height: 350, background: "radial-gradient(circle,rgba(124,77,255,0.06) 0%,transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle,rgba(0,229,255,0.04) 0%,transparent 70%)" }} />
            </div>

            <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 24 }}>
                    <div style={{ width: 58, height: 58, borderRadius: 18, background: "linear-gradient(135deg,#7C4DFF,#00E5FF,#00E676)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🌐</div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>Ecosystem Growth Engine</h1>
                        <p style={{ margin: 0, fontSize: 11, color: "#546e7a", marginTop: 4 }}>Discover advisors · Build reputation · Track your journey · Grow together</p>
                    </div>
                    {/* Quick links */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {QUICK_LINKS.map(l => (
                            <a key={l.label} href={l.href} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, background: `${l.color}10`, border: `1px solid ${l.color}25`, color: l.color, textDecoration: "none", fontSize: 10, fontWeight: 700 }}>
                                <span>{l.icon}</span> {l.label}
                            </a>
                        ))}
                    </div>
                </motion.div>

                {/* Snapshot strip */}
                {snapshot && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 22 }}>
                        {[
                            { l: "Investors", v: fmt(snapshot.totalInvestors), c: "#7C4DFF" },
                            { l: "Verified Advisors", v: snapshot.verifiedAdvisors, c: "#00E676" },
                            { l: "Verified Trades", v: fmt(snapshot.totalVerifiedTrades), c: "#00E5FF" },
                            { l: "Avg Trust", v: `${snapshot.avgTrustScore}/100`, c: "#FFD740" },
                            { l: "Success Rate", v: `${snapshot.investorSuccessRate}%`, c: "#00E676" },
                        ].map(({ l, v, c }) => (
                            <GC key={l} style={{ padding: "10px 8px", textAlign: "center" }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: c }}>{v}</div>
                                <div style={{ fontSize: 8, color: "#546e7a", marginTop: 3, fontWeight: 700 }}>{l}</div>
                            </GC>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{ padding: "8px 15px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, background: tab === t.id ? "linear-gradient(135deg,#7C4DFF,#00E5FF)" : "rgba(255,255,255,0.05)", color: tab === t.id ? "#fff" : "#546e7a", transition: "all 0.2s" }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.14 }}>
                        {tab === "discover" && <DiscoverTab advisors={advisors} />}
                        {tab === "reputation" && <ReputationTab ledger={ledger} />}
                        {tab === "journey" && <JourneyTab journey={journey} />}
                        {tab === "strategy" && <StrategyIntelTab rankings={stratRankings} momentum={momentum} condition={stratCondition} />}
                        {tab === "community" && <CommunityTab posts={posts} />}
                        {tab === "referral" && <ReferralTab referral={referral} network={network} />}
                        {tab === "metrics" && <MetricsTab snapshot={snapshot} trends={trends} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
