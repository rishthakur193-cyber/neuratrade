"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
type BadgeLevel = "PLATINUM" | "GOLD" | "SILVER" | "UNVERIFIED";
type VerificationStatus = "BROKER_VERIFIED" | "UNVERIFIED" | "MISMATCH";

interface AdvisorBadge {
    advisorId: string; advisorName: string; sebiRegNo?: string;
    badgeLevel: BadgeLevel; verifiedTradeCount: number; totalTradeCount: number;
    verificationPct: number; lastVerifiedAt?: string; brokerLinked: boolean;
    stats: { winRate: number; avgReturn: number; maxDrawdown: number; bestTrade: number; worstTrade: number; profitFactor: number };
}

interface VerifiedTrade {
    id: string; symbol: string; exchange: string; brokerOrderId?: string;
    entryPrice: number; exitPrice?: number; stopLoss?: number; target?: number;
    qty: number; returnPct?: number; holdingDays: number;
    result?: "WIN" | "LOSS" | "BREAKEVEN";
    verificationStatus: VerificationStatus; brokerSource: string;
    tradedAt: string; closedAt?: string;
}

// ─── Badge Config ─────────────────────────────────────────────────────────────
const BADGE_CONFIG: Record<BadgeLevel, { color: string; glow: string; icon: string; label: string }> = {
    PLATINUM: { color: "#E5E4E2", glow: "rgba(229,228,226,0.3)", icon: "💎", label: "Platinum Verified" },
    GOLD: { color: "#FFD700", glow: "rgba(255,215,0,0.3)", icon: "🥇", label: "Gold Verified" },
    SILVER: { color: "#C0C0C0", glow: "rgba(192,192,192,0.3)", icon: "🥈", label: "Silver Verified" },
    UNVERIFIED: { color: "#546E7A", glow: "transparent", icon: "⚠️", label: "Unverified" },
};

const VS_CONFIG: Record<VerificationStatus, { color: string; bg: string; label: string; icon: string }> = {
    BROKER_VERIFIED: { color: "#00E676", bg: "rgba(0,230,118,0.1)", label: "BROKER VERIFIED", icon: "✓" },
    UNVERIFIED: { color: "#546E7A", bg: "rgba(84,110,122,0.1)", label: "UNVERIFIED", icon: "?" },
    MISMATCH: { color: "#FF5252", bg: "rgba(255,82,82,0.1)", label: "MISMATCH", icon: "✗" },
};

const RESULT_COLORS = { WIN: "#00E676", LOSS: "#FF5252", BREAKEVEN: "#FFD740" };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
const date = (s?: string) => s ? new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—";

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GC({ children, style = {}, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.03)", border: `1px solid ${glow ? glow : "rgba(255,255,255,0.07)"}`,
            borderRadius: 20, backdropFilter: "blur(20px)", boxShadow: glow ? `0 0 24px ${glow}` : "none",
            transition: "box-shadow 0.3s", ...style,
        }}>{children}</div>
    );
}

// ─── Verification Ring ────────────────────────────────────────────────────────
function VRing({ pct: p, badge }: { pct: number; badge: BadgeLevel }) {
    const r = 34, circ = 2 * Math.PI * r;
    const color = BADGE_CONFIG[badge].color;
    return (
        <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
            <svg width={88} height={88} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
                <motion.circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={8}
                    strokeLinecap="round" strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - (p / 100) * circ }}
                    transition={{ duration: 1.4, ease: "easeOut" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 900, color }}>{p.toFixed(0)}%</span>
                <span style={{ fontSize: 9, color: "#546e7a", fontWeight: 700, marginTop: 1 }}>verified</span>
            </div>
        </div>
    );
}

// ─── Badge Pill ───────────────────────────────────────────────────────────────
function BadgePill({ level }: { level: BadgeLevel }) {
    const c = BADGE_CONFIG[level];
    return (
        <motion.span whileHover={{ scale: 1.05 }} style={{
            display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 800,
            padding: "4px 10px", borderRadius: 6, border: `1px solid ${c.color}40`,
            background: `${c.color}15`, color: c.color, letterSpacing: 0.5,
        }}>
            {c.icon} {c.label.toUpperCase()}
        </motion.span>
    );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function Chip({ label, value, color = "#fff" }: { label: string; value: string; color?: string }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 13px", textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 9, color: "#546e7a", fontWeight: 700, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
        </div>
    );
}

// ─── Leaderboard Card ─────────────────────────────────────────────────────────
function LeaderCard({ a, rank, onSelect }: { a: AdvisorBadge; rank: number; onSelect: () => void }) {
    const bc = BADGE_CONFIG[a.badgeLevel];
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.07 }}
            whileHover={{ y: -3 }} style={{ cursor: "pointer" }} onClick={onSelect}>
            <GC glow={bc.glow} style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {/* Rank */}
                    <div style={{ fontSize: 20, fontWeight: 900, color: bc.color, width: 28, textAlign: "center" }}>
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                    </div>
                    {/* Ring */}
                    <VRing pct={a.verificationPct} badge={a.badgeLevel} />
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{a.advisorName}</div>
                        <div style={{ fontSize: 10, color: "#546e7a", marginBottom: 8 }}>{a.sebiRegNo ?? "—"}</div>
                        <BadgePill level={a.badgeLevel} />
                    </div>
                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, width: 280 }}>
                        <Chip label="Win Rate" value={`${a.stats.winRate}%`} color={a.stats.winRate >= 65 ? "#00e676" : "#ffd740"} />
                        <Chip label="Avg Return" value={pct(a.stats.avgReturn)} color="#00e676" />
                        <Chip label="Max DD" value={`${a.stats.maxDrawdown}%`} color="#ff5252" />
                        <Chip label="Verified" value={`${a.verifiedTradeCount}/${a.totalTradeCount}`} color={bc.color} />
                        <Chip label="Best Trade" value={pct(a.stats.bestTrade)} color="#00e676" />
                        <Chip label="Profit Factor" value={a.stats.profitFactor.toFixed(1)} color="#90caf9" />
                    </div>
                    {/* Arrow */}
                    <div style={{ color: "#546e7a", fontSize: 18 }}>›</div>
                </div>
                {/* Broker link indicator */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.brokerLinked ? "#00e676" : "#546e7a" }} />
                    <span style={{ fontSize: 9, color: a.brokerLinked ? "#00e676" : "#546e7a", fontWeight: 700, letterSpacing: 0.5 }}>
                        {a.brokerLinked ? "ANGEL ONE CONNECTED · LIVE SYNC" : "BROKER NOT LINKED · SELF-REPORTED"}
                    </span>
                    {a.lastVerifiedAt && (
                        <span style={{ fontSize: 9, color: "#37474f", marginLeft: "auto" }}>Last sync: {date(a.lastVerifiedAt)}</span>
                    )}
                </div>
            </GC>
        </motion.div>
    );
}

// ─── Trade Log Table ──────────────────────────────────────────────────────────
function TradeLog({ trades, advisorName }: { trades: VerifiedTrade[]; advisorName: string }) {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#00e676" }}>📋 Verified Trade Log — {advisorName}</div>
                <span style={{ fontSize: 10, color: "#546e7a" }}>{trades.length} records</span>
            </div>
            <GC style={{ overflow: "hidden", padding: 0 }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
                        <thead>
                            <tr style={{ background: "rgba(0,230,118,0.06)" }}>
                                {["Symbol", "Entry", "Exit", "SL", "Target", "Qty", "Return", "Result", "Days", "Verification", "Date"].map(h => (
                                    <th key={h} style={{ padding: "11px 14px", fontSize: 10, fontWeight: 800, color: "#78909c", textAlign: "left", letterSpacing: 0.5, borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {trades.map((t, i) => {
                                const vs = VS_CONFIG[t.verificationStatus];
                                const resultColor = t.result ? RESULT_COLORS[t.result] : "#546e7a";
                                return (
                                    <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                                        style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)" }}>
                                        <td style={td()}><span style={{ fontWeight: 800, color: "#fff" }}>{t.symbol}</span><br /><span style={{ fontSize: 9, color: "#546e7a" }}>{t.exchange}</span></td>
                                        <td style={td()}>₹{fmt(t.entryPrice)}</td>
                                        <td style={td()}>{t.exitPrice ? `₹${fmt(t.exitPrice)}` : "Open"}</td>
                                        <td style={{ ...td(), color: "#ff5252" }}>{t.stopLoss ? `₹${fmt(t.stopLoss)}` : "—"}</td>
                                        <td style={{ ...td(), color: "#00e676" }}>{t.target ? `₹${fmt(t.target)}` : "—"}</td>
                                        <td style={td()}>{t.qty}</td>
                                        <td style={{ ...td(), fontWeight: 700, color: t.returnPct !== undefined ? (t.returnPct >= 0 ? "#00e676" : "#ff5252") : "#546e7a" }}>
                                            {t.returnPct !== undefined ? pct(t.returnPct) : "—"}
                                        </td>
                                        <td style={td()}>
                                            {t.result ? (
                                                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, background: `${resultColor}15`, color: resultColor }}>
                                                    {t.result}
                                                </span>
                                            ) : "—"}
                                        </td>
                                        <td style={td()}>{t.holdingDays}d</td>
                                        <td style={td()}>
                                            <motion.span whileHover={{ scale: 1.05 }} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: vs.bg, color: vs.color }}>
                                                {vs.icon} {vs.label}
                                            </motion.span>
                                            {t.brokerOrderId && (
                                                <div style={{ fontSize: 8, color: "#37474f", marginTop: 2 }}>Order: {t.brokerOrderId.slice(-8)}</div>
                                            )}
                                        </td>
                                        <td style={td()}><span style={{ fontSize: 10, color: "#546e7a" }}>{date(t.tradedAt)}</span></td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </GC>
        </div>
    );
}

function td(): React.CSSProperties {
    return { padding: "11px 14px", fontSize: 12, color: "#90a4ae", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "top" };
}

// ─── Broker Link Form ─────────────────────────────────────────────────────────
function BrokerLinkForm() {
    const [form, setForm] = useState({ advisorId: "", clientCode: "", mpin: "", totp: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!form.advisorId || !form.clientCode || !form.mpin || !form.totp) {
            setStatus("error"); setMessage("All fields are required"); return;
        }
        setStatus("loading");
        try {
            const res = await fetch("/api/advisor/broker-link", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) { setStatus("success"); setMessage(data.message); }
            else { setStatus("error"); setMessage(data.error ?? "Link failed"); }
        } catch { setStatus("error"); setMessage("Network error — please try again"); }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
            <GC style={{ padding: 28 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#00e676", marginBottom: 6 }}>🔗 Link Angel One Broker Account</div>
                <div style={{ fontSize: 11, color: "#546e7a", marginBottom: 24, lineHeight: 1.7 }}>
                    Your trades are fetched directly from Angel One — not self-reported. This makes your
                    performance data <strong style={{ color: "#fff" }}>tamper-proof and independently verified</strong>.
                    Credentials are used only for initial authentication and discarded after token exchange.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                        { key: "advisorId", label: "Advisor ID (internal)", placeholder: "Your NeuraTrade advisor ID" },
                        { key: "clientCode", label: "Angel One Client Code", placeholder: "e.g. A123456" },
                        { key: "mpin", label: "MPIN", placeholder: "4-6 digit MPIN", type: "password" },
                        { key: "totp", label: "TOTP / 2FA Code", placeholder: "6-digit code from authenticator app" },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: "#90a4ae", display: "block", marginBottom: 5 }}>{f.label}</label>
                            <input type={f.type ?? "text"} value={(form as any)[f.key]} placeholder={f.placeholder}
                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 12, boxSizing: "border-box" }} />
                        </div>
                    ))}
                    <button onClick={handleSubmit} disabled={status === "loading"}
                        style={{ padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: "linear-gradient(135deg,#00e676,#7c4dff)", color: "#fff", marginTop: 8 }}>
                        {status === "loading" ? "Authenticating with Angel One..." : "Link Broker & Start Verification →"}
                    </button>
                    {status === "success" && <div style={{ color: "#00e676", fontSize: 12, padding: "10px", background: "rgba(0,230,118,0.08)", borderRadius: 8 }}>✅ {message}</div>}
                    {status === "error" && <div style={{ color: "#ff5252", fontSize: 12, padding: "10px", background: "rgba(255,82,82,0.08)", borderRadius: 8 }}>❌ {message}</div>}
                </div>
            </GC>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <GC style={{ padding: 22 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#7c4dff", marginBottom: 14 }}>🛡️ How Verification Works</div>
                    {[
                        { step: "1", title: "Broker Authentication", desc: "You authenticate with Angel One using your MPIN + TOTP. We obtain a session token — never store your password." },
                        { step: "2", title: "Trade Book Fetch", desc: "Our system pulls your complete trade history directly from Angel One's API. This data is immutable — no one can edit it." },
                        { step: "3", title: "Cross-Reference Engine", desc: "Each broker trade is matched against your published recommendations within ±2% price and ±3 day date window." },
                        { step: "4", title: "Badge Award", desc: "≥80% match → Platinum · ≥60% → Gold · ≥40% → Silver · Below → Unverified" },
                    ].map(s => (
                        <div key={s.step} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#7c4dff,#00e676)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{s.step}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 3 }}>{s.title}</div>
                                <div style={{ fontSize: 11, color: "#78909c", lineHeight: 1.6 }}>{s.desc}</div>
                            </div>
                        </div>
                    ))}
                </GC>
                <GC style={{ padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#ffd740", marginBottom: 10 }}>⚠️ Important Notes</div>
                    {[
                        "Your MPIN and TOTP are never stored — only the session token is saved (base64 encoded).",
                        "Tokens expire after 24 hours. For continuous sync, advisors should re-link daily.",
                        "Only trade records are fetched — no orders are placed on your behalf.",
                        "In production, tokens should be AES-256 encrypted at rest.",
                    ].map((n, i) => (
                        <div key={i} style={{ fontSize: 11, color: "#78909c", marginBottom: 6, paddingLeft: 10, borderLeft: "2px solid #ffd74040", lineHeight: 1.6 }}>
                            {n}
                        </div>
                    ))}
                </GC>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const TABS = [
    { id: "leaderboard", label: "🏆 Verified Leaderboard" },
    { id: "trades", label: "📋 Trade Log" },
    { id: "link", label: "🔗 Link Broker" },
] as const;
type Tab = typeof TABS[number]["id"];

export default function VerifiedPerformancePage() {
    const [tab, setTab] = useState<Tab>("leaderboard");
    const [leaderboard, setLeaderboard] = useState<AdvisorBadge[]>([]);
    const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorBadge | null>(null);
    const [trades, setTrades] = useState<VerifiedTrade[]>([]);
    const [tradesLoading, setTradesLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/advisor/verified-performance")
            .then(r => r.json())
            .then(d => { setLeaderboard(d.leaderboard ?? []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const selectAdvisor = useCallback(async (advisor: AdvisorBadge) => {
        setSelectedAdvisor(advisor);
        setTab("trades");
        setTradesLoading(true);
        try {
            const res = await fetch(`/api/advisor/verified-performance/${advisor.advisorId}`);
            const data = await res.json();
            setTrades(data.trades ?? []);
        } catch { setTrades([]); }
        finally { setTradesLoading(false); }
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "#0B0B12", color: "#fff", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            {/* Glow balls */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: "-100px", right: "-100px", width: 600, height: 600, background: "radial-gradient(circle,rgba(0,230,118,0.08) 0%,transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, width: 500, height: 500, background: "radial-gradient(circle,rgba(124,77,255,0.07) 0%,transparent 70%)" }} />
            </div>

            <div style={{ position: "relative", zIndex: 10, maxWidth: 1180, margin: "0 auto", padding: "36px 24px" }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg,#00e676,#7c4dff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 0 32px rgba(0,230,118,0.3)" }}>✅</div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Advisor Verified Performance</h1>
                            <p style={{ margin: 0, fontSize: 12, color: "#546e7a", marginTop: 4 }}>
                                Broker-verified trade records from Angel One · Cannot be self-reported or manipulated
                            </p>
                        </div>
                        {/* Summary stats */}
                        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
                            {[
                                { label: "Platinum Advisors", value: leaderboard.filter(a => a.badgeLevel === "PLATINUM").length, color: "#E5E4E2" },
                                { label: "Verified Trades", value: leaderboard.reduce((s, a) => s + a.verifiedTradeCount, 0), color: "#00e676" },
                                { label: "Avg Verification", value: `${leaderboard.length > 0 ? Math.round(leaderboard.reduce((s, a) => s + a.verificationPct, 0) / leaderboard.length) : 0}%`, color: "#7c4dff" },
                            ].map(s => (
                                <GC key={s.label} style={{ padding: "10px 16px", textAlign: "center", minWidth: 90 }}>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
                                    <div style={{ fontSize: 9, color: "#546e7a", fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                                </GC>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{
                                padding: "9px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
                                background: tab === t.id ? "linear-gradient(135deg,#00e676,#7c4dff)" : "rgba(255,255,255,0.05)",
                                color: tab === t.id ? "#fff" : "#546e7a", transition: "all 0.2s"
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

                        {/* ── LEADERBOARD ──────────────────────────────────────────────── */}
                        {tab === "leaderboard" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {/* Badge legend */}
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                                    {(["PLATINUM", "GOLD", "SILVER", "UNVERIFIED"] as BadgeLevel[]).map(b => {
                                        const c = BADGE_CONFIG[b];
                                        const count = leaderboard.filter(a => a.badgeLevel === b).length;
                                        return (
                                            <div key={b} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, border: `1px solid ${c.color}30`, background: `${c.color}08` }}>
                                                <span>{c.icon}</span>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: c.color }}>{c.label}</span>
                                                <span style={{ fontSize: 10, color: "#546e7a" }}>({count})</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {loading ? (
                                    <div style={{ textAlign: "center", padding: 60, color: "#546e7a" }}>⚙️ Fetching verified performance data...</div>
                                ) : leaderboard.length === 0 ? (
                                    <GC style={{ padding: 40, textAlign: "center" }}>
                                        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                                        <div style={{ color: "#546e7a" }}>No verified advisors yet. Advisors must link their broker account to appear here.</div>
                                    </GC>
                                ) : (
                                    leaderboard.map((a, i) => (
                                        <LeaderCard key={a.advisorId} a={a} rank={i + 1} onSelect={() => selectAdvisor(a)} />
                                    ))
                                )}
                            </div>
                        )}

                        {/* ── TRADE LOG ────────────────────────────────────────────────── */}
                        {tab === "trades" && (
                            <div>
                                {!selectedAdvisor ? (
                                    <GC style={{ padding: 40, textAlign: "center" }}>
                                        <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
                                        <div style={{ color: "#546e7a", marginBottom: 16 }}>Select an advisor from the leaderboard to view their verified trade log.</div>
                                        <button onClick={() => setTab("leaderboard")}
                                            style={{ padding: "10px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#00e676,#7c4dff)", color: "#fff" }}>
                                            Go to Leaderboard →
                                        </button>
                                    </GC>
                                ) : tradesLoading ? (
                                    <div style={{ textAlign: "center", padding: 60, color: "#546e7a" }}>⚙️ Loading trade log...</div>
                                ) : (
                                    <TradeLog trades={trades} advisorName={selectedAdvisor.advisorName} />
                                )}
                            </div>
                        )}

                        {/* ── BROKER LINK ──────────────────────────────────────────────── */}
                        {tab === "link" && <BrokerLinkForm />}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
