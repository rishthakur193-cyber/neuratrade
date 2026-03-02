"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    AlertTriangle,
    Flame,
    Zap,
    Shield,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    BarChart3,
    SlidersHorizontal,
    Info
} from "lucide-react";

export default function AnalyticsRiskSuite() {
    const [simulationValue, setSimulationValue] = useState(0); // 0 = Normal, -50 = Deep Crash, 50 = Super Bull
    const [riskData, setRiskData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth/register';
            return;
        }

        async function fetchRisk() {
            try {
                const res = await fetch('/api/analytics/risk', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRiskData(data.risk);
                }
            } catch (error) {
                console.error("Risk Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRisk();
    }, []);

    // Dynamic values based on simulation
    const portfolioImpact = (simulationValue * 0.82).toFixed(2);
    const drawdownChance = Math.max(0, (simulationValue < 0 ? -simulationValue * 1.5 : 5)).toFixed(1);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-primary flex items-center justify-center">
                <div className="text-accent-secondary animate-pulse font-bold tracking-widest flex items-center gap-3">
                    <Activity size={24}/> ANALYZING RISKS...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-primary text-white p-10">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Activity className="text-accent-primary" size={32} />
                        Institutional Risk Suite
                    </h1>
                    <p className="text-text-secondary max-w-2xl">
                        Professional-grade stress testing, VaR modeling, and attribution analysis for your connected strategies.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-success/10 text-success px-4 py-2 rounded-xl border border-success/20 text-xs font-bold flex items-center gap-2">
                        <Shield size={16} /> AUDIT STATUS: SECURE
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Risk Simulation Canvas - Left/Center */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="glass-panel p-8 border-accent-secondary/30 bg-accent-secondary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Flame size={120} className="text-accent-secondary" />
                        </div>

                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <SlidersHorizontal className="text-accent-secondary" />
                                Market Stress Simulator
                            </h3>
                            <span className="text-xs bg-accent-secondary/20 text-accent-secondary px-3 py-1 rounded-full font-bold uppercase tracking-widest">Live Engine</span>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-6">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-error">DEEP CRASH (-50%)</span>
                                    <span className="text-text-muted">NEUTRAL</span>
                                    <span className="text-success">HYPER GROWTH (+50%)</span>
                                </div>
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={simulationValue}
                                    onChange={(e) => setSimulationValue(parseInt(e.target.value))}
                                    className="w-full h-2 bg-background-tertiary rounded-full appearance-none accent-accent-secondary cursor-pointer"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center p-6 rounded-2xl bg-background-primary/50 border border-border-subtle">
                                    <p className="text-[10px] text-text-muted uppercase mb-2">Portfolio Impact</p>
                                    <p className={`text- 3xl font - bold ${ simulationValue< 0? 'text-error' : 'text-success'}`}>
                                        {simulationValue > 0 ? '+' : ''}{portfolioImpact}%
                                    </p>
                                </div>
                                <div className="text-center p-6 rounded-2xl bg-background-primary/50 border border-border-subtle">
                                    <p className="text-[10px] text-text-muted uppercase mb-2">Prob. of Drawdown</p>
                                    <p className="text-3xl font-bold">{drawdownChance}%</p>
                                </div>
                                <div className="text-center p-6 rounded-2xl bg-background-primary/50 border border-border-subtle">
                                    <p className="text-[10px] text-text-muted uppercase mb-2">Recovery Time</p>
                                    <p className="text-3xl font-bold">{simulationValue < 0 ? Math.abs(simulationValue / 5).toFixed(0) : '0'} Mo</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/20 flex gap-4 items-center">
                                <Zap className="text-accent-primary shrink-0" size={24} />
                                <p className="text-xs text-text-secondary italic">
                                    AI insight: Your "Alpha Quant" strategy is currently 14% more resilient to downside volatility than the average retail NIFTY portfolio.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Rolling Returns Matrix */}
                        <div className="glass-panel p-6 border-border-subtle">
                            <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-success" />
                                Rolling Returns Matrix
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { period: "1 Year", returns: "24.5%", benchmark: "+12.2%", alpha: "+12.3%" },
                                    { period: "3 Year", returns: "18.2%", benchmark: "+11.5%", alpha: "+6.7%" },
                                    { period: "5 Year", returns: "21.8%", benchmark: "+10.2%", alpha: "+11.6%" },
                                ].map((row, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-background-tertiary/30 border border-border-subtle">
                                        <span className="text-xs font-bold">{row.period}</span>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-success">{row.returns}</p>
                                            <p className="text-[8px] text-text-muted uppercase">Alpha: {row.alpha}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Attribution Heatmap Placeholder */}
                        <div className="glass-panel p-6 border-border-subtle flex flex-col">
                            <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
                                <BarChart3 size={18} className="text-accent-primary" />
                                Sector Attribution Heatmap
                            </h4>
                            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2">
                                <div className="bg-success/40 rounded-lg p-2 flex flex-col justify-between border border-success/20">
                                    <span className="text-[8px] font-bold">IT</span>
                                    <span className="text-xs font-bold">+12%</span>
                                </div>
                                <div className="bg-success/20 rounded-lg p-2 flex flex-col justify-between border border-success/10">
                                    <span className="text-[8px] font-bold">BANKING</span>
                                    <span className="text-xs font-bold">+5%</span>
                                </div>
                                <div className="bg-error/30 rounded-lg p-2 flex flex-col justify-between border border-error/20">
                                    <span className="text-[8px] font-bold">PHARMA</span>
                                    <span className="text-xs font-bold">-3%</span>
                                </div>
                                <div className="bg-accent-primary/20 rounded-lg p-2 flex flex-col justify-between border border-accent-primary/10">
                                    <span className="text-[8px] font-bold">INFRA</span>
                                    <span className="text-xs font-bold">+2.1%</span>
                                </div>
                                <div className="bg-success/60 rounded-lg p-2 flex flex-col justify-between border border-success/30 scale-105 glow-violet">
                                    <span className="text-[8px] font-bold">MFG</span>
                                    <span className="text-xs font-bold">+22%</span>
                                </div>
                                <div className="bg-background-tertiary rounded-lg p-2 flex flex-col justify-between border border-border-subtle">
                                    <span className="text-[8px] font-bold">CASH</span>
                                    <span className="text-xs font-bold">0%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VaR & Detailed Metrics - Right Sidebar */}
                <div className="space-y-10">
                    <div className="glass-panel p-8 border-error/20 bg-error/5 relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 opacity-10">
                            <AlertTriangle size={100} className="text-error" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-error mb-4">Value at Risk (VaR)</h4>
                        <p className="text-4xl font-bold mb-2">₹{riskData?.var95?.toLocaleString('en-IN') || '0'}</p>
                        <p className="text-xs text-text-muted leading-relaxed">
                            95% Confidence Interval: There is only a 5% chance that your portfolio will lose more than ₹{riskData?.var95?.toLocaleString('en-IN') || '0'} in a given holding period.
                        </p>
                        <div className="mt-8 pt-6 border-t border-error/20 space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted">Beta to Nifty 50</span>
                                <span className="font-bold">{riskData?.beta || '1.0'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-text-muted">Max Drawdown</span>
                                <span className="font-bold">{riskData?.maxDrawdown || '0'}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 border-border-subtle">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Shield size={20} className="text-accent-secondary" />
                            Strategy Audits
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] text-text-muted uppercase mb-1">
                                    <span>Fiduciary Compliance</span>
                                    <span className="text-success font-bold">100%</span>
                                </div>
                                <div className="w-full h-1 bg-background-tertiary rounded-full overflow-hidden">
                                    <div className="h-full bg-success w-full" />
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-background-tertiary/50 border border-border-subtle">
                                <h5 className="text-[10px] font-bold uppercase text-accent-secondary mb-2">Latest Audit Note</h5>
                                <p className="text-[10px] text-text-muted leading-relaxed">
                                    Verified by Neura Radar on March 1st. Advisor Arvinder Singh maintains a transparent fee structure with no commission kickbacks detected.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary border border-border-subtle shadow-2xl relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Risk Adjusted</h4>
                                <p className="text-2xl font-bold">{riskData?.sharpeRatio || '0'}</p>
                                <p className="text-[10px] text-success font-bold">SHARPE RATIO</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>
                        <p className="text-[10px] text-text-muted italic">
                            Institutional grade: A sharpe ratio above 1.5 is considered exceptional for retail-connected strategies.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
