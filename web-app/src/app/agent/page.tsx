"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────
type ModuleStatus = "COMPLETE" | "IN_PROGRESS" | "REMAINING" | "STUB";

interface ModuleSummary {
    id: string;
    name: string;
    layer: string;
    status: ModuleStatus;
    purpose: string;
    howItWorks: string;
    dependents: string[];
    apis: string[];
}

interface LogEntry {
    timestamp: string;
    task: string;
    result: string;
    nextStep: string;
    module?: string;
    level: "INFO" | "WARN" | "SUCCESS" | "ERROR";
}

interface Suggestion {
    area: string;
    suggestion: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
}

interface AgentStatus {
    generatedAt: string;
    completionPercent: number;
    totalModules: number;
    modules: ModuleSummary[];
    byStatus: Record<ModuleStatus, ModuleSummary[]>;
    recentLog: LogEntry[];
    suggestions: Suggestion[];
    plainSummary: {
        built: string[];
        remaining: string[];
        howItWorks: string;
    };
}

// ─── Colour Maps ───────────────────────────────────────────────────────────
const STATUS_COLORS: Record<ModuleStatus, string> = {
    COMPLETE: "#00e676",
    IN_PROGRESS: "#ffd740",
    REMAINING: "#40c4ff",
    STUB: "#ff5252",
};

const STATUS_BG: Record<ModuleStatus, string> = {
    COMPLETE: "rgba(0,230,118,0.08)",
    IN_PROGRESS: "rgba(255,215,64,0.08)",
    REMAINING: "rgba(64,196,255,0.08)",
    STUB: "rgba(255,82,82,0.08)",
};

const STATUS_EMOJI: Record<ModuleStatus, string> = {
    COMPLETE: "✅",
    IN_PROGRESS: "🔧",
    REMAINING: "⏳",
    STUB: "⚠️",
};

const LAYER_BADGE: Record<string, string> = {
    BACKEND: "#7c4dff",
    FRONTEND: "#00b0ff",
    SHARED: "#ff6d00",
};

const LOG_COLORS: Record<LogEntry["level"], string> = {
    SUCCESS: "#00e676",
    INFO: "#90caf9",
    WARN: "#ffd740",
    ERROR: "#ff5252",
};

const PRIORITY_COLORS: Record<string, string> = {
    HIGH: "#ff5252",
    MEDIUM: "#ffd740",
    LOW: "#40c4ff",
};

// ─── Radial Completion Ring ────────────────────────────────────────────────
function CompletionRing({ percent }: { percent: number }) {
    const r = 54;
    const circ = 2 * Math.PI * r;
    const dash = (percent / 100) * circ;

    return (
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <svg width={140} height={140} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
                <motion.circle
                    cx={70} cy={70} r={r}
                    fill="none"
                    stroke="url(#ringGrad)"
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - dash }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00e676" />
                        <stop offset="100%" stopColor="#40c4ff" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-center">
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{percent}%</div>
                <div style={{ fontSize: 10, color: "#90a4ae", fontWeight: 700, letterSpacing: 1 }}>COMPLETE</div>
            </div>
        </div>
    );
}

// ─── Module Card ───────────────────────────────────────────────────────────
function ModuleCard({ module }: { module: ModuleSummary }) {
    const [expanded, setExpanded] = useState(false);
    const col = STATUS_COLORS[module.status];
    const bg = STATUS_BG[module.status];
    const layerColor = LAYER_BADGE[module.layer] ?? "#607d8b";

    return (
        <motion.div
            layout
            onClick={() => setExpanded(!expanded)}
            style={{
                background: bg,
                border: `1px solid ${col}30`,
                borderRadius: 12,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "border-color 0.2s",
            }}
            whileHover={{ borderColor: `${col}80`, scale: 1.01 }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{STATUS_EMOJI[module.status]}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{module.name}</div>
                    <div style={{ fontSize: 10, color: col, fontWeight: 600, marginTop: 2 }}>{module.status}</div>
                </div>
                <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 1,
                    background: `${layerColor}20`, color: layerColor,
                    padding: "3px 7px", borderRadius: 4,
                }}>{module.layer}</span>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}
                    >
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid rgba(255,255,255,0.05)` }}>
                            <p style={{ fontSize: 12, color: "#b0bec5", marginBottom: 8 }}>
                                <span style={{ color: "#fff", fontWeight: 700 }}>Purpose: </span>{module.purpose}
                            </p>
                            <p style={{ fontSize: 12, color: "#b0bec5", marginBottom: 8 }}>
                                <span style={{ color: "#fff", fontWeight: 700 }}>How it works: </span>{module.howItWorks}
                            </p>
                            {module.apis.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <span style={{ fontSize: 10, color: col, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>APIs / Data Sources</span>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                                        {module.apis.map(api => (
                                            <span key={api} style={{
                                                fontSize: 9, fontWeight: 600, padding: "2px 6px",
                                                background: "rgba(255,255,255,0.05)", borderRadius: 4, color: "#90caf9"
                                            }}>{api}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Log Entry Row ─────────────────────────────────────────────────────────
function LogRow({ entry }: { entry: LogEntry }) {
    const col = LOG_COLORS[entry.level];
    const ts = new Date(entry.timestamp).toLocaleTimeString("en-IN", { hour12: false });
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                padding: "10px 14px",
                borderLeft: `3px solid ${col}`,
                background: `${col}08`,
                borderRadius: "0 8px 8px 0",
                marginBottom: 8,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: col, textTransform: "uppercase" }}>{entry.level}</span>
                <span style={{ fontSize: 10, color: "#546e7a" }}>{ts}</span>
            </div>
            <div style={{ fontSize: 12, color: "#eceff1", fontWeight: 600 }}>{entry.task}</div>
            <div style={{ fontSize: 11, color: "#90a4ae", marginTop: 2 }}>→ {entry.result}</div>
            <div style={{ fontSize: 10, color: "#546e7a", marginTop: 2 }}>↪ {entry.nextStep}</div>
        </motion.div>
    );
}

// ─── Suggestion Card ────────────────────────────────────────────────────────
function SuggestionCard({ s }: { s: Suggestion }) {
    const col = PRIORITY_COLORS[s.priority];
    return (
        <div style={{
            padding: "14px 16px",
            background: `${col}08`,
            border: `1px solid ${col}25`,
            borderRadius: 12,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{s.area}</span>
                <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 8px",
                    background: `${col}20`, color: col, borderRadius: 4, letterSpacing: 1
                }}>{s.priority}</span>
            </div>
            <p style={{ fontSize: 12, color: "#90a4ae", lineHeight: 1.6 }}>{s.suggestion}</p>
        </div>
    );
}

// ─── Architecture Map ────────────────────────────────────────────────────
function ArchitectureMap() {
    const layers = [
        {
            label: "👤 User Browser", color: "#40c4ff",
            items: ["Investor", "Advisor", "Admin"],
        },
        {
            label: "🖥️ Next.js App Router (Frontend)", color: "#00b0ff",
            items: [
                "Landing Page", "Auth Pages", "Investor Dashboard",
                "Advisor Dashboard", "Training Journey", "KYC Module",
                "Admin Dashboard", "Leaderboard", "Trust Center", "Agent Dashboard (/agent)"
            ],
        },
        {
            label: "⚙️ Services Layer", color: "#7c4dff",
            items: [
                "Auth Service (JWT+2FA)", "Portfolio Service", "AI Risk Engine (Gemini)",
                "SmartAPI Broker", "Matching Engine", "Audit Service",
                "Analytics", "Communication", "Training", "Email", "Payment (stub)"
            ],
        },
        {
            label: "🔧 Backend (Express + Cloud Run)", color: "#ff6d00",
            items: ["REST API Server", "WebSocket Server", "Rate Limiter", "Auth Middleware", "Error Handler", "Pino Logger"],
        },
        {
            label: "🗄️ Data Layer", color: "#00e676",
            items: ["PostgreSQL (Prisma)", "Google Cloud Storage (KYC — planned)"],
        },
        {
            label: "🌐 External APIs", color: "#ffd740",
            items: ["Angel One SmartAPI (REST + WS)", "Google Gemini 1.5 Flash", "SendGrid Email", "Razorpay (planned)", "Google Cloud Run"],
        },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {layers.map((layer, i) => (
                <React.Fragment key={layer.label}>
                    <div style={{
                        background: `${layer.color}08`,
                        border: `1px solid ${layer.color}30`,
                        borderRadius: 12,
                        padding: "14px 18px",
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: layer.color, marginBottom: 10 }}>{layer.label}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {layer.items.map(item => (
                                <span key={item} style={{
                                    fontSize: 10, fontWeight: 600,
                                    background: `${layer.color}15`,
                                    color: "#eceff1",
                                    padding: "4px 10px",
                                    borderRadius: 6,
                                }}>{item}</span>
                            ))}
                        </div>
                    </div>
                    {i < layers.length - 1 && (
                        <div style={{ textAlign: "center", color: "#37474f", fontSize: 18, lineHeight: 1 }}>↕</div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

// ─── Main Dashboard Page ────────────────────────────────────────────────────
export default function AgentDashboard() {
    const [status, setStatus] = useState<AgentStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [activeTab, setActiveTab] = useState<"status" | "architecture" | "log" | "suggestions" | "summary">("status");

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/agent/status");
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setStatus(data);
            setLastRefresh(new Date());
        } catch {
            // Keep existing data on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const tabs = [
        { id: "status", label: "📊 Build Status" },
        { id: "architecture", label: "🗺️ Architecture" },
        { id: "log", label: "📋 Dev Log" },
        { id: "suggestions", label: "💡 Improvements" },
        { id: "summary", label: "📰 Plain Summary" },
    ] as const;

    const glassCard: React.CSSProperties = {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        padding: "24px",
        backdropFilter: "blur(20px)",
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0B0B12",
            color: "#fff",
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}>
            {/* Fixed background blobs */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 600, height: 600, background: "radial-gradient(circle, rgba(124,77,255,0.12) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, width: 500, height: 500, background: "radial-gradient(circle, rgba(0,230,118,0.07) 0%, transparent 70%)" }} />
            </div>

            <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: "linear-gradient(135deg, #7c4dff, #00e676)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 24, boxShadow: "0 0 30px rgba(124,77,255,0.4)"
                        }}>🤖</div>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>
                                Self-Reporting Dev Agent
                            </h1>
                            <p style={{ fontSize: 12, color: "#546e7a", margin: 0, marginTop: 4 }}>
                                Ecosystem of Smart Investing — Live Build Status
                            </p>
                        </div>
                        <div style={{ marginLeft: "auto", textAlign: "right" }}>
                            {lastRefresh && (
                                <div style={{ fontSize: 10, color: "#37474f" }}>
                                    Last refresh: {lastRefresh.toLocaleTimeString("en-IN")}
                                </div>
                            )}
                            <div style={{ fontSize: 10, color: "#00e676", marginTop: 2 }}>● Auto-refresh every 5s</div>
                        </div>
                    </div>
                </motion.div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: 80, color: "#546e7a" }}>
                        <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
                        <div>Loading agent status...</div>
                    </div>
                ) : status ? (
                    <>
                        {/* KPI Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                            {[
                                { label: "Total Modules", value: status.totalModules, color: "#90caf9" },
                                { label: "Complete", value: status.byStatus.COMPLETE?.length ?? 0, color: "#00e676" },
                                { label: "Stubs", value: status.byStatus.STUB?.length ?? 0, color: "#ff5252" },
                                { label: "In Progress", value: status.byStatus.IN_PROGRESS?.length ?? 0, color: "#ffd740" },
                            ].map(kpi => (
                                <motion.div key={kpi.label}
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ ...glassCard, textAlign: "center", padding: "20px 16px" }}
                                >
                                    <div style={{ fontSize: 32, fontWeight: 900, color: kpi.color }}>{kpi.value}</div>
                                    <div style={{ fontSize: 10, color: "#546e7a", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{kpi.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Completion ring + tabs row */}
                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "start", marginBottom: 32 }}>
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                style={{ ...glassCard, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
                            >
                                <CompletionRing percent={status.completionPercent} />
                                <div style={{ fontSize: 11, color: "#546e7a", fontWeight: 600 }}>Overall Progress</div>
                            </motion.div>

                            {/* Tabs */}
                            <div style={glassCard}>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                                    {tabs.map(tab => (
                                        <button key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={{
                                                padding: "7px 14px",
                                                borderRadius: 8,
                                                border: "none",
                                                cursor: "pointer",
                                                fontWeight: 700,
                                                fontSize: 12,
                                                background: activeTab === tab.id ? "linear-gradient(135deg, #7c4dff, #00e676)" : "rgba(255,255,255,0.05)",
                                                color: activeTab === tab.id ? "#fff" : "#546e7a",
                                                transition: "all 0.2s",
                                            }}
                                        >{tab.label}</button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <AnimatePresence mode="wait">
                                    <motion.div key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        {activeTab === "status" && (
                                            <div>
                                                {(["COMPLETE", "IN_PROGRESS", "STUB", "REMAINING"] as ModuleStatus[]).map(st => {
                                                    const mods = status.byStatus[st] ?? [];
                                                    if (!mods.length) return null;
                                                    return (
                                                        <div key={st} style={{ marginBottom: 20 }}>
                                                            <div style={{ fontSize: 11, fontWeight: 800, color: STATUS_COLORS[st], marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                                                                {STATUS_EMOJI[st]} {st} ({mods.length})
                                                            </div>
                                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
                                                                {mods.map(m => <ModuleCard key={m.id} module={m} />)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {activeTab === "architecture" && <ArchitectureMap />}

                                        {activeTab === "log" && (
                                            <div style={{ maxHeight: 420, overflowY: "auto" }}>
                                                {status.recentLog.length === 0 ? (
                                                    <div style={{ textAlign: "center", padding: 40, color: "#546e7a" }}>
                                                        No log entries yet.<br />
                                                        <span style={{ fontSize: 12 }}>Run the CLI agent to generate logs: <code style={{ background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>cd agent && npx ts-node run.ts</code></span>
                                                    </div>
                                                ) : (
                                                    status.recentLog.slice().reverse().map((entry, i) => <LogRow key={i} entry={entry} />)
                                                )}
                                            </div>
                                        )}

                                        {activeTab === "suggestions" && (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                                                {status.suggestions.map(s => <SuggestionCard key={s.area} s={s} />)}
                                            </div>
                                        )}

                                        {activeTab === "summary" && (
                                            <div>
                                                <p style={{ fontSize: 13, color: "#90a4ae", lineHeight: 1.8, marginBottom: 20 }}>
                                                    NeuraTrade is a premium investing platform that connects SEBI-verified financial advisors with sophisticated investors. Think of it as a <strong style={{ color: "#fff" }}>"verified LinkedIn for money advisors"</strong> combined with an institutional-grade investing dashboard.
                                                </p>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                                    <div>
                                                        <div style={{ fontSize: 11, fontWeight: 800, color: "#00e676", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>✅ What's Built</div>
                                                        {status.plainSummary.built.map(item => (
                                                            <div key={item} style={{
                                                                fontSize: 12, color: "#b0bec5", padding: "8px 12px",
                                                                background: "rgba(0,230,118,0.05)", borderRadius: 8, marginBottom: 6,
                                                                borderLeft: "3px solid #00e67640"
                                                            }}>• {item}</div>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 11, fontWeight: 800, color: "#ffd740", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>⚠️ What's Remaining</div>
                                                        {status.plainSummary.remaining.map(item => (
                                                            <div key={item} style={{
                                                                fontSize: 12, color: "#b0bec5", padding: "8px 12px",
                                                                background: "rgba(255,215,64,0.05)", borderRadius: 8, marginBottom: 6,
                                                                borderLeft: "3px solid #ffd74040"
                                                            }}>• {item}</div>
                                                        ))}
                                                        <div style={{ marginTop: 20 }}>
                                                            <div style={{ fontSize: 11, fontWeight: 800, color: "#40c4ff", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>🔄 Full Journey</div>
                                                            <div style={{ fontSize: 12, color: "#90a4ae", lineHeight: 1.8 }}>{status.plainSummary.howItWorks}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* CLI Instructions */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                            style={{ ...glassCard, borderColor: "rgba(124,77,255,0.2)" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#7c4dff", marginBottom: 16 }}>🖥️ Run the CLI Agent</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                                {[
                                    { cmd: "cd agent && npx ts-node run.ts", desc: "Full interactive run" },
                                    { cmd: "cd agent && npx ts-node run.ts --status", desc: "Status only" },
                                    { cmd: "cd agent && npx ts-node run.ts --log", desc: "View dev log" },
                                    { cmd: "npm run agent", desc: "Via root scripts" },
                                ].map(({ cmd, desc }) => (
                                    <div key={cmd} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px" }}>
                                        <code style={{ fontSize: 11, color: "#40c4ff" }}>{cmd}</code>
                                        <div style={{ fontSize: 10, color: "#546e7a", marginTop: 4 }}>{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: 80, color: "#ff5252" }}>
                        ❌ Failed to load agent status.
                    </div>
                )}
            </div>
        </div>
    );
}
