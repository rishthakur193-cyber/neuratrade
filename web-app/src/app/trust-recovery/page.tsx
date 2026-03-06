"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Stage = "LEARN" | "SIMULATE" | "INVEST";
type RiskLabel = "SAFE" | "MODERATE" | "HIGH_RISK" | "DANGEROUS";
type ConfTrend = "IMPROVING" | "STABLE" | "DECLINING";
type RepLabel = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

interface RecoveryProfile { lossLevel: string; recoveryPath: string; pathLabel: string; totalLossAmt: number; confidenceLevel: number; availableCapital: number; recommendation: string; lossSource: string; experienceLevel: string; }
interface Assessment { overallRiskBehaviourScore: number; riskLabel: RiskLabel; primaryDanger: string; revengeTradingScore: number; overLeverageScore: number; strategyHoppingScore: number; tipFollowingScore: number; dangerWarnings: string[]; actionItems: string[]; }
interface StageInfo { stage: Stage; label: string; description: string; capitalLimit: number | null; requirement: string; icon: string; color: string; }
interface Progress { currentStage: Stage; stageProgress: number; learnScore: number; simulationPnl: number; disciplineScore: number; capitalUnlocked: number; winRate: number; totalSimTrades: number; capitalLimit: number | null; nextStageRequirement: string; isReadyToAdvance: boolean; stages: StageInfo[]; }
interface SafeAdvisor { advisorId: string; name: string; sebiRegNo: string; strategy: string; verificationBadge: string; trustScore: number; maxDrawdown: number; winRate: number; avgMonthlyReturn: number; preferredMarket: string; safetyTags: string[]; isRecommendedForRecovery: boolean; }
interface MonthlyMetric { month: string; drawdownPct: number; disciplineScore: number; winRate: number; confidenceIndex: number; }
interface RecoverySummary { latestConfidenceIndex: number; confidenceTrend: ConfTrend; avgDrawdown: number; bestMonth: string; totalProfitableMonths: number; disciplineImprovement: number; overallProgress: number; metrics: MonthlyMetric[]; milestones: string[]; }
interface TrustSignal { advisorId: string; advisorName: string; verificationBadge: string; verificationPct: number; totalVerifiedTrades: number; scamFlags: number; reputationScore: number; reputationLabel: RepLabel; trustColor: string; }
interface PlatformReport { totalAdvisors: number; verifiedAdvisors: number; scamFlagsDetected: number; scamFlagsResolved: number; averageTrustScore: number; totalVerifiedTrades: number; investorProtectionRate: number; }

// ─── Intake Form ──────────────────────────────────────────────────────────────
const LOSS_RANGES = ["Below ₹25,000", "₹25,000 – ₹1 Lakh", "₹1 Lakh – ₹5 Lakh", "₹5 Lakh – ₹25 Lakh", "Above ₹25 Lakh"];
const LOSS_VALUES: Record<string, number> = { "Below ₹25,000": 15000, "₹25,000 – ₹1 Lakh": 62500, "₹1 Lakh – ₹5 Lakh": 250000, "₹5 Lakh – ₹25 Lakh": 1500000, "Above ₹25 Lakh": 3000000 };
const CAP_RANGES = ["Below ₹10,000", "₹10,000 – ₹50,000", "₹50,000 – ₹2 Lakh", "Above ₹2 Lakh"];
const CAP_VALUES: Record<string, number> = { "Below ₹10,000": 5000, "₹10,000 – ₹50,000": 30000, "₹50,000 – ₹2 Lakh": 100000, "Above ₹2 Lakh": 500000 };

// ─── Colors / Config ──────────────────────────────────────────────────────────
const STAGE_COLORS: Record<Stage, string> = { LEARN: "#7C4DFF", SIMULATE: "#FFD740", INVEST: "#00E676" };
const RISK_COLORS: Record<RiskLabel, string> = { SAFE: "#00E676", MODERATE: "#FFD740", HIGH_RISK: "#FF9800", DANGEROUS: "#FF5252" };
const TREND_COLORS: Record<ConfTrend, string> = { IMPROVING: "#00E676", STABLE: "#90CAF9", DECLINING: "#FF5252" };
const REP_COLORS: Record<RepLabel, string> = { EXCELLENT: "#00E676", GOOD: "#69F0AE", FAIR: "#FFD740", POOR: "#FF5252" };
const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ─── Shared components ────────────────────────────────────────────────────────
function GC({ children, style = {}, glow = "" }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
    return <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${glow || "rgba(255,255,255,0.08)"}`, borderRadius: 16, backdropFilter: "blur(16px)", boxShadow: glow ? `0 0 24px ${glow}30` : "none", ...style }}>{children}</div>;
}
function Tag({ label, color }: { label: string; color: string }) {
    return <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 5, background: `${color}18`, color, border: `1px solid ${color}30`, whiteSpace: "nowrap" }}>{label}</span>;
}
function Bar({ value, color, max = 100 }: { value: number; color: string; max?: number }) {
    return (
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.9 }}
                style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
        </div>
    );
}

// ─── Onboarding Intake Form ───────────────────────────────────────────────────
function IntakeForm({ onComplete }: { onComplete: (profile: RecoveryProfile) => void }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        lossRange: LOSS_RANGES[1], capRange: CAP_RANGES[0], lossSource: "ADVISOR",
        experience: "BEGINNER", confidence: 4,
        tradedAfterLoss: true, oversize: true, hopped: true, tips: true,
    });
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        // Fire intake + psychology in parallel
        const [intakeRes, psychRes] = await Promise.all([
            fetch("/api/recovery/intake", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: "mock-user", totalLossAmt: LOSS_VALUES[formData.lossRange], lossSource: formData.lossSource, experienceLevel: formData.experience, confidenceLevel: formData.confidence, availableCapital: CAP_VALUES[formData.capRange] }),
            }),
            fetch("/api/recovery/psychology", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: "mock-user", tradedAfterLoss: formData.tradedAfterLoss, positionSizeOver20pct: formData.oversize, changedStrategy3xIn6m: formData.hopped, followedWhatsAppTips: formData.tips }),
            }),
        ]);
        const { profile } = await intakeRes.json();
        setLoading(false);
        onComplete(profile);
    };

    const inputCls: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 13, outline: "none" };

    return (
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <GC style={{ padding: 36 }}>
                {/* Step indicator */}
                <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? "#7C4DFF" : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>

                        {step === 1 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>💔 Loss Experience</div>
                                    <div style={{ fontSize: 12, color: "#546e7a" }}>Help us understand your market journey so we can create your Recovery Plan.</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: 10, color: "#78909c", fontWeight: 700, display: "block", marginBottom: 6 }}>APPROXIMATE TOTAL LOSS</label>
                                    <select style={inputCls} value={formData.lossRange} onChange={e => setFormData(f => ({ ...f, lossRange: e.target.value }))}>
                                        {LOSS_RANGES.map(r => <option key={r} style={{ background: "#0B0B12" }}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 10, color: "#78909c", fontWeight: 700, display: "block", marginBottom: 6 }}>WHERE DID LOSSES COME FROM?</label>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {[["SELF", "Self-Trading"], ["ADVISOR", "Advisor Tips"], ["BOTH", "Both"]].map(([v, l]) => (
                                            <button key={v} onClick={() => setFormData(f => ({ ...f, lossSource: v }))}
                                                style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, background: formData.lossSource === v ? "rgba(124,77,255,0.3)" : "rgba(255,255,255,0.05)", color: formData.lossSource === v ? "#B388FF" : "#78909c", transition: "all 0.2s" }}>
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: 10, color: "#78909c", fontWeight: 700, display: "block", marginBottom: 6 }}>CAPITAL AVAILABLE TO RESTART</label>
                                    <select style={inputCls} value={formData.capRange} onChange={e => setFormData(f => ({ ...f, capRange: e.target.value }))}>
                                        {CAP_RANGES.map(r => <option key={r} style={{ background: "#0B0B12" }}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 10, color: "#78909c", fontWeight: 700, display: "block", marginBottom: 8 }}>EXPERIENCE LEVEL</label>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map(v => (
                                            <button key={v} onClick={() => setFormData(f => ({ ...f, experience: v }))}
                                                style={{ flex: 1, padding: "9px 6px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 10, background: formData.experience === v ? "rgba(124,77,255,0.3)" : "rgba(255,255,255,0.05)", color: formData.experience === v ? "#B388FF" : "#78909c", transition: "all 0.2s" }}>
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => setStep(2)} style={{ padding: "14px", borderRadius: 12, background: "linear-gradient(135deg,#7C4DFF,#00E5FF)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
                                    Continue → Confidence Level
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>🧠 Confidence Level</div>
                                    <div style={{ fontSize: 12, color: "#546e7a" }}>How confident are you about investing in markets right now?</div>
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                        <span style={{ fontSize: 11, color: "#FF5252" }}>😰 Very Low</span>
                                        <span style={{ fontSize: 18, fontWeight: 900, color: formData.confidence <= 3 ? "#FF5252" : formData.confidence <= 6 ? "#FFD740" : "#00E676" }}>{formData.confidence}/10</span>
                                        <span style={{ fontSize: 11, color: "#00E676" }}>💪 Very High</span>
                                    </div>
                                    <input type="range" min={1} max={10} value={formData.confidence} onChange={e => setFormData(f => ({ ...f, confidence: parseInt(e.target.value) }))}
                                        style={{ width: "100%", accentColor: "#7C4DFF" }} />
                                </div>
                                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "none", color: "#78909c", fontWeight: 700, cursor: "pointer" }}>← Back</button>
                                    <button onClick={() => setStep(3)} style={{ flex: 2, padding: "13px", borderRadius: 12, background: "linear-gradient(135deg,#7C4DFF,#00E5FF)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Continue → Psychology</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                <div>
                                    <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>⚠️ Behaviour Assessment</div>
                                    <div style={{ fontSize: 12, color: "#546e7a" }}>Be honest — this helps us identify risky patterns so you can correct them.</div>
                                </div>
                                {[
                                    { key: "tradedAfterLoss", q: "I have traded immediately after a major loss (within 24 hours)" },
                                    { key: "oversize", q: "I sometimes put more than 20% of my capital in a single trade" },
                                    { key: "hopped", q: "I've changed my trading strategy more than 3 times in the last 6 months" },
                                    { key: "tips", q: "I have traded based on WhatsApp groups or social media tips" },
                                ].map(({ key, q }) => (
                                    <div key={key} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                                        <input type="checkbox" checked={(formData as any)[key]} onChange={e => setFormData(f => ({ ...f, [key]: e.target.checked }))}
                                            style={{ marginTop: 2, accentColor: "#7C4DFF", width: 16, height: 16, flexShrink: 0 }} />
                                        <div style={{ fontSize: 12, color: "#90a4ae", lineHeight: 1.5 }}>{q}</div>
                                    </div>
                                ))}
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "none", color: "#78909c", fontWeight: 700, cursor: "pointer" }}>← Back</button>
                                    <button onClick={submit} disabled={loading}
                                        style={{ flex: 2, padding: "14px", borderRadius: 12, background: "linear-gradient(135deg,#00C853,#00E676)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
                                        {loading ? "⚙️ Generating Profile..." : "✅ Generate Recovery Plan"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </GC>
        </div>
    );
}

// ─── TAB COMPONENTS ───────────────────────────────────────────────────────────

function RecoveryMap({ progress }: { progress: Progress | null }) {
    if (!progress) return <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading...</div>;
    const stages = progress.stages ?? [
        { stage: "LEARN", label: "Stage 1 — Learn", description: "Study risk management and strategy basics.", capitalLimit: 0, requirement: "Score ≥ 70 on assessment.", icon: "📚", color: "#7C4DFF" },
        { stage: "SIMULATE", label: "Stage 2 — Simulate", description: "Follow advisors in paper trading mode.", capitalLimit: 10000, requirement: "10 trades, win rate ≥ 55%.", icon: "🎯", color: "#FFD740" },
        { stage: "INVEST", label: "Stage 3 — Invest", description: "Deploy real capital with verified advisors.", capitalLimit: null, requirement: "2+ profitable months.", icon: "🏦", color: "#00E676" },
    ];
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {stages.map((s, i) => {
                const isCurrent = s.stage === progress.currentStage;
                const isPast = ["LEARN", "SIMULATE", "INVEST"].indexOf(s.stage) < ["LEARN", "SIMULATE", "INVEST"].indexOf(progress.currentStage);
                const c = STAGE_COLORS[s.stage];
                return (
                    <motion.div key={s.stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <GC glow={isCurrent ? c : isPast ? "#00E67640" : ""} style={{ padding: "20px 22px", opacity: isPast ? 0.7 : 1 }}>
                            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: isPast ? "#00E67615" : isCurrent ? `${c}20` : "rgba(255,255,255,0.04)", border: `2px solid ${isPast ? "#00E676" : isCurrent ? c : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                                    {isPast ? "✅" : s.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                        <span style={{ fontWeight: 900, fontSize: 15 }}>{s.label}</span>
                                        {isCurrent && <Tag label="CURRENT STAGE" color={c} />}
                                        {isPast && <Tag label="COMPLETED" color="#00E676" />}
                                    </div>
                                    <div style={{ fontSize: 12, color: "#78909c", marginBottom: 10 }}>{s.description}</div>
                                    {isCurrent && (
                                        <>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                                <span style={{ fontSize: 10, color: "#546e7a", fontWeight: 700 }}>Stage Progress</span>
                                                <span style={{ fontSize: 12, fontWeight: 800, color: c }}>{progress.stageProgress}%</span>
                                            </div>
                                            <Bar value={progress.stageProgress} color={c} />
                                            <div style={{ fontSize: 10, color: "#546e7a", marginTop: 8 }}>Next: {progress.nextStageRequirement}</div>
                                        </>
                                    )}
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontSize: 10, color: "#546e7a", fontWeight: 700 }}>CAPITAL</div>
                                    <div style={{ fontWeight: 900, fontSize: 14, color: s.capitalLimit === null ? "#00E676" : s.capitalLimit === 0 ? "#FF5252" : "#FFD740", marginTop: 2 }}>
                                        {s.capitalLimit === null ? "Unlimited" : s.capitalLimit === 0 ? "Simulation Only" : fmt(s.capitalLimit)}
                                    </div>
                                </div>
                            </div>
                        </GC>
                    </motion.div>
                );
            })}

            {/* Key stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                    { label: "Learn Score", val: `${progress.learnScore}/100`, color: "#7C4DFF" },
                    { label: "Sim PnL", val: fmt(progress.simulationPnl), color: progress.simulationPnl >= 0 ? "#00E676" : "#FF5252" },
                    { label: "Win Rate", val: `${progress.winRate}%`, color: progress.winRate >= 55 ? "#00E676" : "#FFD740" },
                    { label: "Discipline", val: `${progress.disciplineScore}/100`, color: "#00E5FF" },
                ].map(({ label, val, color }) => (
                    <GC key={label} style={{ padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color }}>{val}</div>
                        <div style={{ fontSize: 9, color: "#546e7a", marginTop: 4, fontWeight: 700 }}>{label}</div>
                    </GC>
                ))}
            </div>
        </div>
    );
}

function PsychologyPanel({ assessment }: { assessment: Assessment | null }) {
    if (!assessment) return <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading...</div>;
    const c = RISK_COLORS[assessment.riskLabel];
    const patterns = [
        { label: "Revenge Trading", score: assessment.revengeTradingScore, icon: "😡" },
        { label: "Over-Leverage", score: assessment.overLeverageScore, icon: "⚡" },
        { label: "Strategy Hopping", score: assessment.strategyHoppingScore, icon: "🔀" },
        { label: "Tip Following", score: assessment.tipFollowingScore, icon: "📱" },
    ];
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Overall score */}
            <GC glow={c} style={{ padding: "24px 28px", textAlign: "center" }}>
                <div style={{ fontSize: 60, fontWeight: 900, color: c, lineHeight: 1 }}>{assessment.overallRiskBehaviourScore}</div>
                <div style={{ fontSize: 12, color: "#546e7a", marginTop: 4 }}>Risk Behaviour Score</div>
                <Tag label={assessment.riskLabel.replace("_", " ")} color={c} />
                <div style={{ fontSize: 11, color: "#78909c", marginTop: 14, lineHeight: 1.6, maxWidth: 400, margin: "12px auto 0" }}>{assessment.primaryDanger}</div>
            </GC>
            {/* Pattern breakdown */}
            <GC style={{ padding: 22 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 16 }}>⚠️ Behaviour Pattern Breakdown</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {patterns.map(p => {
                        const pc = p.score >= 20 ? "#FF5252" : p.score >= 12 ? "#FF9800" : p.score >= 5 ? "#FFD740" : "#00E676";
                        return (
                            <div key={p.label}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700 }}>{p.icon} {p.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 900, color: pc }}>{p.score}/25</span>
                                </div>
                                <Bar value={p.score} color={pc} max={25} />
                            </div>
                        );
                    })}
                </div>
            </GC>
            {/* Action items */}
            {assessment.actionItems?.length > 0 && (
                <GC style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>✅ Action Plan</div>
                    {assessment.actionItems.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(0,230,118,0.04)", border: "1px solid rgba(0,230,118,0.12)", marginBottom: 8 }}>
                            <span style={{ color: "#00E676", flexShrink: 0 }}>→</span>
                            <div style={{ fontSize: 11, color: "#90a4ae", lineHeight: 1.6 }}>{item}</div>
                        </div>
                    ))}
                </GC>
            )}
        </div>
    );
}

function SafeAdvisors({ advisors, stage }: { advisors: SafeAdvisor[]; stage: Stage }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(0,230,118,0.06)", border: "1px solid rgba(0,230,118,0.15)", fontSize: 11, color: "#00E676", fontWeight: 700 }}>
                🛡️ Only showing SEBI-verified advisors with drawdown &lt; 15% and win rate ≥ 60% — safe for {stage} stage
            </div>
            {advisors.map((a, i) => {
                const bc = a.verificationBadge === "PLATINUM" ? "#E5E4E2" : "#FFD700";
                return (
                    <motion.div key={a.advisorId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <GC style={{ padding: "18px 20px" }}>
                            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${bc}18`, border: `1px solid ${bc}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                                    {a.verificationBadge === "PLATINUM" ? "💎" : "🥇"}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                                        <span style={{ fontWeight: 800, fontSize: 14 }}>{a.name}</span>
                                        <Tag label={a.verificationBadge} color={bc} />
                                        {a.isRecommendedForRecovery && <Tag label="RECOVERY APPROVED" color="#00E676" />}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#546e7a", marginBottom: 8 }}>{a.sebiRegNo} · {a.strategy} · {a.preferredMarket}</div>
                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                        {a.safetyTags.map(t => <Tag key={t} label={t} color="#7C4DFF" />)}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                                    {[
                                        { l: "Trust Score", v: `${a.trustScore}/100`, c: "#00E676" },
                                        { l: "Max Drawdown", v: `${a.maxDrawdown}%`, c: a.maxDrawdown < 10 ? "#00E676" : "#FFD740" },
                                        { l: "Win Rate", v: `${a.winRate}%`, c: a.winRate >= 70 ? "#00E676" : "#FFD740" },
                                    ].map(({ l, v, c }) => (
                                        <div key={l}>
                                            <div style={{ fontSize: 9, color: "#546e7a", fontWeight: 700 }}>{l}</div>
                                            <div style={{ fontSize: 13, fontWeight: 900, color: c }}>{v}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </GC>
                    </motion.div>
                );
            })}
        </div>
    );
}

function ConfidenceDashboard({ summary }: { summary: RecoverySummary | null }) {
    if (!summary) return <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading...</div>;
    const tc = TREND_COLORS[summary.confidenceTrend];
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Overall index */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                {[
                    { label: "Confidence Index", val: `${summary.latestConfidenceIndex}`, unit: "/100", color: tc },
                    { label: "Trend", val: summary.confidenceTrend, unit: "", color: tc },
                    { label: "Avg Drawdown", val: `${summary.avgDrawdown}%`, unit: "", color: summary.avgDrawdown < 10 ? "#00E676" : "#FF9800" },
                    { label: "Discipline +", val: `+${summary.disciplineImprovement}`, unit: "", color: "#7C4DFF" },
                ].map(({ label, val, color }) => (
                    <GC key={label} style={{ padding: "14px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color }}>{val}</div>
                        <div style={{ fontSize: 9, color: "#546e7a", marginTop: 4, fontWeight: 700 }}>{label}</div>
                    </GC>
                ))}
            </div>
            {/* Monthly chart */}
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 16 }}>📈 Monthly Recovery Progress</div>
                {summary.metrics.map((m, i) => (
                    <div key={m.month} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#90a4ae" }}>{m.month}</span>
                            <div style={{ display: "flex", gap: 12 }}>
                                <span style={{ fontSize: 10, color: "#546e7a" }}>Drawdown: <b style={{ color: m.drawdownPct < 10 ? "#00E676" : "#FF9800" }}>{m.drawdownPct}%</b></span>
                                <span style={{ fontSize: 10, color: "#546e7a" }}>Win Rate: <b style={{ color: m.winRate >= 50 ? "#00E676" : "#FF5252" }}>{m.winRate}%</b></span>
                                <span style={{ fontSize: 10, color: "#546e7a" }}>Conf: <b style={{ color: "#7C4DFF" }}>{m.confidenceIndex}</b></span>
                            </div>
                        </div>
                        <Bar value={m.confidenceIndex} color={i === summary.metrics.length - 1 ? "#7C4DFF" : "#546e7a"} />
                    </div>
                ))}
            </GC>
            {/* Milestones */}
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>🏁 Recovery Milestones</div>
                {summary.milestones.map((m, i) => (
                    <div key={i} style={{ fontSize: 12, color: m.startsWith("✅") ? "#b0bec5" : "#78909c", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        {m}
                    </div>
                ))}
            </GC>
        </div>
    );
}

function TrustSignalsPanel({ signals, report }: { signals: TrustSignal[]; report: PlatformReport | null }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Platform stats */}
            {report && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {[
                        { label: "Verified Advisors", val: report.verifiedAdvisors, color: "#00E676" },
                        { label: "Verified Trades", val: report.totalVerifiedTrades.toLocaleString(), color: "#7C4DFF" },
                        { label: "Scam Flags Resolved", val: `${report.scamFlagsResolved}/${report.scamFlagsDetected}`, color: "#FFD740" },
                        { label: "Investor Protection", val: `${report.investorProtectionRate}%`, color: "#00E676" },
                    ].map(({ label, val, color }) => (
                        <GC key={label} style={{ padding: "14px 12px", textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 900, color }}>{val}</div>
                            <div style={{ fontSize: 9, color: "#546e7a", marginTop: 4, fontWeight: 700 }}>{label}</div>
                        </GC>
                    ))}
                </div>
            )}
            {/* Advisor trust signals */}
            <GC style={{ padding: 22 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 16 }}>🔭 Advisor Verification Status</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {signals.map((s, i) => {
                        const rc = REP_COLORS[s.reputationLabel];
                        return (
                            <motion.div key={s.advisorId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <span style={{ fontSize: 18 }}>{s.verificationBadge === "PLATINUM" ? "💎" : "🥇"}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 800 }}>{s.advisorName}</div>
                                        <div style={{ fontSize: 10, color: "#546e7a", marginTop: 2 }}>{s.totalVerifiedTrades} verified trades · {s.scamFlags} scam flags</div>
                                    </div>
                                    <div style={{ width: 100 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: 9, color: "#546e7a" }}>Verified</span>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: "#00E676" }}>{s.verificationPct}%</span>
                                        </div>
                                        <Bar value={s.verificationPct} color="#00E676" />
                                    </div>
                                    <Tag label={s.reputationLabel} color={rc} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </GC>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const TABS = [
    { id: "map", label: "🧭 Recovery Map" },
    { id: "psychology", label: "🧠 Psychology" },
    { id: "advisors", label: "🛡️ Safe Advisors" },
    { id: "confidence", label: "📊 Confidence" },
    { id: "trust", label: "🔭 Trust Signals" },
] as const;
type Tab = typeof TABS[number]["id"];

export default function TrustRecoveryPage() {
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const [profile, setProfile] = useState<RecoveryProfile | null>(null);
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [progress, setProgress] = useState<Progress | null>(null);
    const [advisors, setAdvisors] = useState<SafeAdvisor[]>([]);
    const [summary, setSummary] = useState<RecoverySummary | null>(null);
    const [signals, setSignals] = useState<TrustSignal[]>([]);
    const [platformReport, setPlatformReport] = useState<PlatformReport | null>(null);
    const [tab, setTab] = useState<Tab>("map");
    const [loading, setLoading] = useState(true);

    const loadAll = useCallback(async (userId = "mock-user") => {
        const [profileRes, assessRes, progressRes, advisorRes, metricsRes, trustRes] = await Promise.all([
            fetch(`/api/recovery/intake?userId=${userId}`),
            fetch(`/api/recovery/psychology?userId=${userId}`),
            fetch(`/api/recovery/progress?userId=${userId}`),
            fetch("/api/recovery/advisors?stage=SIMULATE"),
            fetch(`/api/recovery/metrics?userId=${userId}`),
            fetch("/api/recovery/trust-signals"),
        ]);
        const [pd, ad, prd, avd, md, td] = await Promise.all([
            profileRes.json(), assessRes.json(), progressRes.json(), advisorRes.json(), metricsRes.json(), trustRes.json(),
        ]);
        setProfile(pd.profile);
        setAssessment(ad.assessment);
        setProgress(prd.progress);
        setAdvisors(avd.advisors ?? []);
        setSummary(md.summary);
        setSignals(td.signals ?? []);
        setPlatformReport(td.report ?? null);
        setHasProfile(!!pd.profile);
        setLoading(false);
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const handleIntakeComplete = async (p: RecoveryProfile) => {
        setProfile(p);
        setHasProfile(true);
        await loadAll();
    };

    const stage = progress?.currentStage ?? "LEARN";
    const stageColor = STAGE_COLORS[stage];

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#0B0B12", display: "flex", alignItems: "center", justifyContent: "center", color: "#546e7a" }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 16 }}>🔄</div><div>Loading Recovery Engine...</div></div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0B0B12", color: "#fff", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Ambient */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(circle,rgba(124,77,255,0.07) 0%,transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 500, height: 500, background: "radial-gradient(circle,rgba(0,230,118,0.04) 0%,transparent 70%)" }} />
            </div>

            <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

                {/* ── Header ──────────────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#7C4DFF,#00E676)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                        🛡️
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>Investor Trust Recovery Engine</h1>
                        <p style={{ margin: 0, fontSize: 11, color: "#546e7a", marginTop: 3 }}>Rebuild confidence through structured learning, verified guidance, and controlled investing</p>
                    </div>
                    {profile && (
                        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                            <GC style={{ padding: "10px 16px", textAlign: "center" }}>
                                <div style={{ fontSize: 12, fontWeight: 900, color: stageColor }}>{stage}</div>
                                <div style={{ fontSize: 9, color: "#546e7a", marginTop: 2 }}>STAGE</div>
                            </GC>
                            <GC style={{ padding: "10px 16px", textAlign: "center" }}>
                                <div style={{ fontSize: 12, fontWeight: 900, color: "#00E676" }}>{profile.lossLevel}</div>
                                <div style={{ fontSize: 9, color: "#546e7a", marginTop: 2 }}>LOSS LEVEL</div>
                            </GC>
                            <GC style={{ padding: "10px 16px", textAlign: "center" }}>
                                <div style={{ fontSize: 11, fontWeight: 900, color: "#7C4DFF" }}>{profile.pathLabel?.split("+")[0]?.trim()}</div>
                                <div style={{ fontSize: 9, color: "#546e7a", marginTop: 2 }}>RECOVERY PATH</div>
                            </GC>
                        </div>
                    )}
                </motion.div>

                {/* ── Recommendation Banner ─────────────────────────────────────── */}
                {profile?.recommendation && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.2)", marginBottom: 22, fontSize: 12, color: "#B388FF", lineHeight: 1.6 }}>
                        💡 {profile.recommendation}
                    </motion.div>
                )}

                {/* ── Intake Form (first visit) ─────────────────────────────────── */}
                {!hasProfile ? (
                    <div>
                        <div style={{ textAlign: "center", marginBottom: 28 }}>
                            <div style={{ fontSize: 16, color: "#546e7a", marginBottom: 8 }}>No recovery profile found. Let's create yours.</div>
                        </div>
                        <IntakeForm onComplete={handleIntakeComplete} />
                    </div>
                ) : (
                    <>
                        {/* ── Tabs ──────────────────────────────────────────────────── */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
                            {TABS.map(t => (
                                <button key={t.id} onClick={() => setTab(t.id)}
                                    style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, background: tab === t.id ? "linear-gradient(135deg,#7C4DFF,#00E5FF)" : "rgba(255,255,255,0.05)", color: tab === t.id ? "#fff" : "#546e7a", transition: "all 0.2s" }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
                                {tab === "map" && <RecoveryMap progress={progress} />}
                                {tab === "psychology" && <PsychologyPanel assessment={assessment} />}
                                {tab === "advisors" && <SafeAdvisors advisors={advisors} stage={stage} />}
                                {tab === "confidence" && <ConfidenceDashboard summary={summary} />}
                                {tab === "trust" && <TrustSignalsPanel signals={signals} report={platformReport} />}
                            </motion.div>
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}
