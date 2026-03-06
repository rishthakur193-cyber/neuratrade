"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BrokerInfo { broker: string; displayName: string; isConfigured: boolean; connectUrl?: string; }
interface Holding { symbol: string; exchange: string; quantity: number; avgPrice: number; currentPrice: number; pnl: number; pnlPct: number; }
interface Portfolio { broker: string; clientId: string; totalValue: number; totalPnl: number; totalPnlPct: number; holdings: Holding[]; fetchedAt: string; }
interface PortfolioHealth { healthScore: number; riskExposure: string; diversificationScore: number; recommendations: string[]; }
interface VerifiedTrade { tradeId: string; symbol: string; transactionType: string; quantity: number; price: number; tradeDate: string; brokerVerified: boolean; }
interface TradeHistory { broker: string; totalTrades: number; winTrades: number; lossTrades: number; winRate: number; trades: VerifiedTrade[]; }
interface AdvisorVerif { advisorId: string; broker: string; verifiedTrades: number; winRate: number; avgReturn: number; maxDrawdown: number; verificationScore: number; isVerified: boolean; }

// ─── Shared UI ────────────────────────────────────────────────────────────────
function GC({ children, style = {}, glow = "" }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
    return <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${glow || "rgba(255,255,255,0.08)"}`, borderRadius: 16, backdropFilter: "blur(16px)", boxShadow: glow ? `0 0 24px ${glow}28` : "none", ...style }}>{children}</div>;
}
function Bar({ value, color, max = 100 }: { value: number; color: string; max?: number }) {
    return <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (value / max) * 100)}%` }} transition={{ duration: 0.85 }} style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${color}80,${color})` }} />
    </div>;
}
function Tag({ label, color }: { label: string; color: string }) {
    return <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 5, background: `${color}18`, color, border: `1px solid ${color}30` }}>{label}</span>;
}

const BROKER_COLORS: Record<string, string> = { ZERODHA: "#387ED1", ANGELONE: "#EF5023", UPSTOX: "#6C03AF" };
const BROKER_EMOJIS: Record<string, string> = { ZERODHA: "🔵", ANGELONE: "🟠", UPSTOX: "🟣" };

// ─── Tab: Brokers ─────────────────────────────────────────────────────────────
function BrokersTab({ brokers, onConnect }: { brokers: BrokerInfo[]; onConnect: (broker: string) => void }) {
    const [selected, setSelected] = useState<string | null>(null);
    const [clientId, setClientId] = useState("");
    const [mpin, setMpin] = useState("");
    const [totp, setTotp] = useState("");
    const [reqToken, setReqToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const connect = async (broker: string) => {
        setLoading(true); setMsg("");
        const body: any = { broker, clientId };
        if (broker === "ANGELONE") { body.mpin = mpin; body.totp = totp; }
        else body.requestToken = reqToken;
        const res = await fetch("/api/broker-integration/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        setLoading(false);
        setMsg(data.session?.message ?? data.error ?? "Connected");
        if (data.session) onConnect(broker);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                {brokers.map(b => {
                    const bc = BROKER_COLORS[b.broker] ?? "#546e7a";
                    const isSelected = selected === b.broker;
                    return (
                        <motion.div key={b.broker} whileHover={{ scale: 1.02 }}>
                            <GC glow={isSelected ? bc : ""} style={{ padding: "22px 18px", cursor: "pointer", textAlign: "center" }} >
                                <div onClick={() => setSelected(isSelected ? null : b.broker)}>
                                    <div style={{ fontSize: 36, marginBottom: 10 }}>{BROKER_EMOJIS[b.broker] ?? "🏦"}</div>
                                    <div style={{ fontWeight: 900, fontSize: 15 }}>{b.displayName}</div>
                                    <div style={{ fontSize: 10, color: b.isConfigured ? "#00E676" : "#FFD740", marginTop: 6, fontWeight: 700 }}>
                                        {b.isConfigured ? "✅ API Configured" : "⚠️ Demo Mode"}
                                    </div>
                                    <div style={{ marginTop: 10, fontSize: 10, color: "#546e7a" }}>
                                        {b.isConfigured ? "Click to connect" : "Set env vars to go live"}
                                    </div>
                                </div>
                                {isSelected && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 16, textAlign: "left" }}>
                                        <input placeholder="Client ID" value={clientId} onChange={e => setClientId(e.target.value)} style={{ width: "100%", marginBottom: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
                                        {b.broker === "ANGELONE" ? (
                                            <>
                                                <input placeholder="MPIN" type="password" value={mpin} onChange={e => setMpin(e.target.value)} style={{ width: "100%", marginBottom: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
                                                <input placeholder="TOTP (optional)" value={totp} onChange={e => setTotp(e.target.value)} style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
                                            </>
                                        ) : (
                                            <input placeholder={b.broker === "ZERODHA" ? "Request Token (from OAuth)" : "Auth Code (from OAuth)"} value={reqToken} onChange={e => setReqToken(e.target.value)} style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
                                        )}
                                        {b.connectUrl && <div style={{ marginBottom: 8 }}><a href={b.connectUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: bc }}>🔗 Open OAuth Login</a></div>}
                                        <button onClick={() => connect(b.broker)} disabled={loading} style={{ width: "100%", padding: "9px", borderRadius: 10, background: `linear-gradient(135deg,${bc}80,${bc})`, border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 11 }}>
                                            {loading ? "Connecting..." : `Connect to ${b.displayName}`}
                                        </button>
                                        {msg && <div style={{ marginTop: 8, fontSize: 10, color: msg.includes("demo") || msg.includes("established") ? "#00E676" : "#FF5252" }}>{msg}</div>}
                                    </motion.div>
                                )}
                            </GC>
                        </motion.div>
                    );
                })}
            </div>
            <GC style={{ padding: 18 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, color: "#FFD740" }}>ℹ️ How to go from Demo → Live</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    {[
                        { b: "Zerodha", k: "ZERODHA_API_KEY, ZERODHA_API_SECRET", d: "Kite Connect Developer → Create App → Copy API Key & Secret" },
                        { b: "Angel One", k: "SMARTAPI_API_KEY, SMARTAPI_CLIENT_CODE, SMARTAPI_MPIN", d: "SmartAPI Developer Portal → Generate API Key → Use Client Code + MPIN" },
                        { b: "Upstox", k: "UPSTOX_API_KEY, UPSTOX_API_SECRET, UPSTOX_REDIRECT_URI", d: "Upstox Developer Console → Register App → Copy API Key & Secret" },
                    ].map(({ b, k, d }) => (
                        <div key={b} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ fontWeight: 800, fontSize: 11, color: "#B388FF", marginBottom: 6 }}>{b}</div>
                            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#00E5FF", marginBottom: 6, wordBreak: "break-all" }}>{k}</div>
                            <div style={{ fontSize: 9, color: "#546e7a", lineHeight: 1.6 }}>{d}</div>
                        </div>
                    ))}
                </div>
            </GC>
        </div>
    );
}

// ─── Tab: Portfolio ───────────────────────────────────────────────────────────
function PortfolioTab({ portfolio, health }: { portfolio: Portfolio | null; health: PortfolioHealth | null }) {
    if (!portfolio) return <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading portfolio...</div>;
    const hc = health?.healthScore ?? 0;
    const healthColor = hc >= 75 ? "#00E676" : hc >= 50 ? "#FFD740" : "#FF5252";
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {[
                    { l: "Portfolio Value", v: `₹${portfolio.totalValue.toLocaleString("en-IN")}`, c: "#7C4DFF" },
                    { l: "Total P&L", v: `₹${portfolio.totalPnl.toLocaleString("en-IN")}`, c: portfolio.totalPnl >= 0 ? "#00E676" : "#FF5252" },
                    { l: "P&L %", v: `${portfolio.totalPnlPct.toFixed(1)}%`, c: portfolio.totalPnlPct >= 0 ? "#00E676" : "#FF5252" },
                    { l: "Health Score", v: `${hc}/100`, c: healthColor },
                ].map(({ l, v, c }) => <GC key={l} style={{ padding: "14px", textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 9, color: "#546e7a", marginTop: 4, fontWeight: 700 }}>{l}</div></GC>)}
            </div>
            {health && (
                <GC style={{ padding: 18 }}>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 36, fontWeight: 900, color: healthColor }}>{hc}</div>
                            <div style={{ fontSize: 9, color: "#546e7a", fontWeight: 700 }}>HEALTH SCORE</div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontSize: 11, color: "#90a4ae" }}>Portfolio Health</span>
                                <span style={{ fontWeight: 800, fontSize: 11, color: healthColor }}>{hc}%</span>
                            </div>
                            <Bar value={hc} color={healthColor} />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                                <span style={{ fontSize: 10, color: "#546e7a" }}>Risk Exposure</span>
                                <Tag label={health.riskExposure} color={health.riskExposure === "LOW" ? "#00E676" : health.riskExposure === "MEDIUM" ? "#FFD740" : "#FF5252"} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                                <span style={{ fontSize: 10, color: "#546e7a" }}>Diversification</span>
                                <span style={{ fontWeight: 800, fontSize: 11, color: "#00E5FF" }}>{health.diversificationScore}/100</span>
                            </div>
                        </div>
                    </div>
                    {health.recommendations.map(r => (
                        <div key={r} style={{ fontSize: 11, color: "#90a4ae", padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", marginBottom: 6, borderLeft: "3px solid #7C4DFF" }}>💡 {r}</div>
                    ))}
                </GC>
            )}
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>📂 Holdings — <Tag label={portfolio.broker} color={BROKER_COLORS[portfolio.broker] ?? "#546e7a"} /></div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                        <thead><tr style={{ color: "#546e7a", fontSize: 9, fontWeight: 800 }}>
                            {["Symbol", "Qty", "Avg Price", "LTP", "P&L", "P&L %"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontWeight: 700 }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {portfolio.holdings.map((h, i) => (
                                <motion.tr key={h.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                    <td style={{ padding: "10px 10px", fontWeight: 800 }}>{h.symbol}<span style={{ marginLeft: 6, fontSize: 8, color: "#546e7a" }}>{h.exchange}</span></td>
                                    <td style={{ padding: "10px 10px", color: "#90a4ae" }}>{h.quantity}</td>
                                    <td style={{ padding: "10px 10px", color: "#90a4ae" }}>₹{h.avgPrice.toLocaleString("en-IN")}</td>
                                    <td style={{ padding: "10px 10px", fontWeight: 800 }}>₹{h.currentPrice.toLocaleString("en-IN")}</td>
                                    <td style={{ padding: "10px 10px", fontWeight: 800, color: h.pnl >= 0 ? "#00E676" : "#FF5252" }}>₹{h.pnl.toLocaleString("en-IN")}</td>
                                    <td style={{ padding: "10px 10px", fontWeight: 800, color: h.pnlPct >= 0 ? "#00E676" : "#FF5252" }}>{h.pnlPct.toFixed(1)}%</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GC>
        </div>
    );
}

// ─── Tab: Trades ─────────────────────────────────────────────────────────────
function TradesTab({ trades }: { trades: TradeHistory | null }) {
    if (!trades) return <div style={{ color: "#546e7a", textAlign: "center", padding: 60 }}>Loading trades...</div>;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {[
                    { l: "Total Trades", v: trades.totalTrades, c: "#7C4DFF" },
                    { l: "Win Trades", v: trades.winTrades, c: "#00E676" },
                    { l: "Loss Trades", v: trades.lossTrades, c: "#FF5252" },
                    { l: "Win Rate", v: `${trades.winRate}%`, c: trades.winRate >= 60 ? "#00E676" : "#FFD740" },
                ].map(({ l, v, c }) => <GC key={l} style={{ padding: "14px", textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 9, color: "#546e7a", marginTop: 4, fontWeight: 700 }}>{l}</div></GC>)}
            </div>
            <GC style={{ padding: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>📋 Verified Trade Log — <Tag label={trades.broker} color={BROKER_COLORS[trades.broker] ?? "#546e7a"} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {trades.trades.map((t, i) => (
                        <motion.div key={t.tradeId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 100px 100px 50px", gap: 10, alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <div style={{ fontWeight: 800, fontSize: 12 }}>{t.symbol}</div>
                                <Tag label={t.transactionType} color={t.transactionType === "BUY" ? "#00E676" : "#FF5252"} />
                                <div style={{ fontSize: 11, color: "#90a4ae" }}>Qty: {t.quantity}</div>
                                <div style={{ fontSize: 11, fontWeight: 700 }}>₹{t.price.toLocaleString("en-IN")}</div>
                                <div style={{ fontSize: 10, color: "#546e7a" }}>{t.tradeDate}</div>
                                <div style={{ fontSize: 11, color: t.brokerVerified ? "#00E676" : "#FF5252" }}>{t.brokerVerified ? "✓" : "✗"}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </GC>
        </div>
    );
}

// ─── Tab: Verify Advisor ─────────────────────────────────────────────────────
function VerifyTab() {
    const [advisor, setAdvisor] = useState("");
    const [broker, setBroker] = useState<string>("ZERODHA");
    const [result, setResult] = useState<AdvisorVerif | null>(null);
    const [loading, setLoading] = useState(false);

    const verify = async () => {
        setLoading(true); setResult(null);
        const res = await fetch(`/api/broker-integration/trades?broker=${broker}&verify=true&clientId=${advisor || "eco-adv-1"}&accessToken=MOCK`);
        const data = await res.json();
        setResult(data.verification ?? null);
        setLoading(false);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <GC style={{ padding: 24 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>🔍 Verify Advisor Performance</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input placeholder="Advisor Client ID" value={advisor} onChange={e => setAdvisor(e.target.value)}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 12, outline: "none", minWidth: 180 }} />
                    <select value={broker} onChange={e => setBroker(e.target.value)}
                        style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 12, outline: "none" }}>
                        <option value="ZERODHA">Zerodha</option>
                        <option value="ANGELONE">Angel One</option>
                        <option value="UPSTOX">Upstox</option>
                    </select>
                    <button onClick={verify} disabled={loading}
                        style={{ padding: "10px 24px", borderRadius: 10, background: "linear-gradient(135deg,#7C4DFF,#00E5FF)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 12, opacity: loading ? 0.6 : 1 }}>
                        {loading ? "Verifying..." : "🔬 Verify via Broker"}
                    </button>
                </div>
            </GC>
            {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <GC glow={result.isVerified ? "#00E676" : "#FF5252"} style={{ padding: 28 }}>
                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                            <div style={{ fontSize: 56 }}>{result.isVerified ? "✅" : "❌"}</div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: result.isVerified ? "#00E676" : "#FF5252", marginTop: 8 }}>
                                {result.isVerified ? "Advisor Verified" : "Verification Failed"}
                            </div>
                            <div style={{ fontSize: 11, color: "#546e7a", marginTop: 4 }}>via {result.broker} · {new Date().toLocaleString("en-IN")}</div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
                            {[
                                { l: "Verified Trades", v: result.verifiedTrades, c: "#7C4DFF" },
                                { l: "Win Rate", v: `${result.winRate}%`, c: result.winRate >= 60 ? "#00E676" : "#FFD740" },
                                { l: "Avg Monthly Return", v: `${result.avgReturn}%`, c: "#00E5FF" },
                                { l: "Max Drawdown", v: `${result.maxDrawdown}%`, c: "#FF9800" },
                                { l: "Verification Score", v: `${result.verificationScore}/100`, c: result.verificationScore >= 60 ? "#00E676" : "#FF5252" },
                            ].map(({ l, v, c }) => <div key={l} style={{ textAlign: "center", padding: "12px", borderRadius: 10, background: "rgba(255,255,255,0.04)" }}><div style={{ fontSize: 18, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 9, color: "#546e7a", marginTop: 4, fontWeight: 700 }}>{l}</div></div>)}
                        </div>
                    </GC>
                </motion.div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
    { id: "brokers", label: "🔌 Brokers" },
    { id: "portfolio", label: "📂 Portfolio" },
    { id: "trades", label: "📋 Trades" },
    { id: "verify", label: "🔬 Verify Advisor" },
] as const;
type Tab = typeof TABS[number]["id"];

export default function BrokerIntegrationPage() {
    const [tab, setTab] = useState<Tab>("brokers");
    const [brokers, setBrokers] = useState<BrokerInfo[]>([]);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [health, setHealth] = useState<PortfolioHealth | null>(null);
    const [trades, setTrades] = useState<TradeHistory | null>(null);
    const [selBroker, setSelBroker] = useState("ZERODHA");

    const loadBrokers = useCallback(async () => {
        const res = await fetch("/api/broker-integration/brokers");
        const data = await res.json();
        setBrokers(data.brokers ?? []);
    }, []);

    const loadPortfolio = useCallback(async (broker: string) => {
        const res = await fetch(`/api/broker-integration/portfolio?broker=${broker}&accessToken=MOCK&clientId=demo-user`);
        const data = await res.json();
        setPortfolio(data.portfolio ?? null);
        setHealth(data.health ?? null);
    }, []);

    const loadTrades = useCallback(async (broker: string) => {
        const res = await fetch(`/api/broker-integration/trades?broker=${broker}&accessToken=MOCK&clientId=demo-user`);
        const data = await res.json();
        setTrades(data.trades ?? null);
    }, []);

    useEffect(() => {
        loadBrokers();
        loadPortfolio(selBroker);
        loadTrades(selBroker);
    }, [loadBrokers, loadPortfolio, loadTrades, selBroker]);

    const QUICK_LINKS = [
        { label: "Ecosystem", icon: "🌐", href: "/ecosystem", color: "#7C4DFF" },
        { label: "Market Intelligence", icon: "⚡", href: "/market-intelligence", color: "#FFD740" },
        { label: "Trust Recovery", icon: "🛡️", href: "/trust-recovery", color: "#00E676" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#0B0B12", color: "#fff", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: 0, left: "20%", width: 600, height: 300, background: "radial-gradient(circle,rgba(56,126,209,0.05) 0%,transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: "30%", right: "15%", width: 400, height: 400, background: "radial-gradient(circle,rgba(108,3,175,0.04) 0%,transparent 70%)" }} />
            </div>

            <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 28 }}>
                    <div style={{ width: 58, height: 58, borderRadius: 18, background: "linear-gradient(135deg,#387ED1,#6C03AF,#EF5023)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🔌</div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Broker Integration Layer</h1>
                        <p style={{ margin: 0, fontSize: 11, color: "#546e7a", marginTop: 4 }}>Connect Zerodha · Angel One · Upstox — portfolio sync, verified trades, advisor verification</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {QUICK_LINKS.map(l => <a key={l.label} href={l.href} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, background: `${l.color}10`, border: `1px solid ${l.color}25`, color: l.color, textDecoration: "none", fontSize: 10, fontWeight: 700 }}>{l.icon} {l.label}</a>)}
                    </div>
                </motion.div>

                {/* Broker selector strip */}
                <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                    {(["ZERODHA", "ANGELONE", "UPSTOX"] as const).map(b => (
                        <button key={b} onClick={() => { setSelBroker(b); setPortfolio(null); setTrades(null); loadPortfolio(b); loadTrades(b); }}
                            style={{ padding: "7px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, background: selBroker === b ? `linear-gradient(135deg,${BROKER_COLORS[b]}80,${BROKER_COLORS[b]})` : "rgba(255,255,255,0.05)", color: selBroker === b ? "#fff" : "#546e7a" }}>
                            {BROKER_EMOJIS[b]} {b}
                        </button>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 11, background: tab === t.id ? "linear-gradient(135deg,#7C4DFF,#00E5FF)" : "rgba(255,255,255,0.05)", color: tab === t.id ? "#fff" : "#546e7a" }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.14 }}>
                        {tab === "brokers" && <BrokersTab brokers={brokers} onConnect={(b) => { setSelBroker(b); loadPortfolio(b); loadTrades(b); setTab("portfolio"); }} />}
                        {tab === "portfolio" && <PortfolioTab portfolio={portfolio} health={health} />}
                        {tab === "trades" && <TradesTab trades={trades} />}
                        {tab === "verify" && <VerifyTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
