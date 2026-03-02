"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    TrendingUp,
    ShieldAlert,
    Zap,
    BarChart3,
    PieChart,
    ArrowRight,
    ChevronRight,
    Filter,
    CheckCircle2
} from "lucide-react";

const strategies = [
    {
        id: "alpha-quant",
        name: "Alpha Quant Factor",
        manager: "Capital Wealth Strategies",
        type: "Algorithmic",
        cagr: "24.5%",
        minInv: "₹5,00,000",
        risk: "High",
        description: "Multi-factor quantitative model targeting high growth through mid-cap momentum anomalies.",
        tags: ["High Alpha", "Equities", "Momentum"],
        status: "Recommended"
    },
    {
        id: "safe-haven",
        name: "Safe Haven Dividend Yield",
        manager: "Sarah Fernandes",
        type: "Advisor-Led",
        cagr: "12.8%",
        minInv: "₹10,00,000",
        risk: "Low",
        description: "Capital preservation strategy focusing on blue-chip dividend aristocrats and GOI bonds.",
        tags: ["Dividends", "Bonds", "Low Volatility"],
        status: "Perfect Match"
    },
    {
        id: "tech-future",
        name: "Tech Innovators ETF",
        manager: "Automated",
        type: "Passive Index",
        cagr: "18.2%",
        minInv: "₹50,000",
        risk: "Medium",
        description: "Diversified exposure to the top 20 IT and semiconductor companies listed on NSE/BSE.",
        tags: ["Technology", "Broad Market"],
        status: "Neutral"
    }
];

export default function StrategySelection() {
    const [selectedRisk, setSelectedRisk] = useState("All");

    const filteredStrategies = strategies.filter(s => selectedRisk === "All" || s.risk === selectedRisk);

    return (
        <div className="min-h-screen bg-background-primary text-white p-10 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary opacity-10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-secondary opacity-10 blur-[100px] pointer-events-none" />

            <header className="mb-14 max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-4 text-accent-secondary">
                    <Target size={24} />
                    <span className="font-bold tracking-widest uppercase text-xs">Strategy Discovery</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    Find Your Edge.
                </h1>
                <p className="text-xl text-text-secondary max-w-2xl">
                    Explore audited portfolios aligned with your risk profile. Every strategy here is backed by SEBI-registered logic.
                </p>
            </header>

            <main className="max-w-5xl mx-auto space-y-10 z-10 relative">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-background-secondary/50 p-4 rounded-2xl border border-border-subtle backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-text-muted uppercase flex items-center gap-2">
                            <Filter size={16} /> Risk Tolerance:
                        </span>
                        <div className="flex gap-2">
                            {["All", "Low", "Medium", "High"].map(risk => (
                                <button
                                    key={risk}
                                    onClick={() => setSelectedRisk(risk)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRisk === risk ? 'bg-accent-secondary text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-background-tertiary text-text-muted hover:bg-background-tertiary/80'
                                        }`}
                                >
                                    {risk}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="text-sm font-bold text-success flex items-center gap-2">
                        <Zap size={16} /> 2 AI Recommendations
                    </div>
                </div>

                {/* Strategy List */}
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {filteredStrategies.map((strategy, i) => (
                            <motion.div
                                key={strategy.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                                className={`glass-panel p-6 border-border-subtle cursor-pointer group hover:border-${strategy.status === 'Perfect Match' ? 'success' :
                                        strategy.status === 'Recommended' ? 'accent-secondary' : 'accent-primary'
                                    }/50 transition-all flex flex-col md:flex-row gap-8 items-center bg-gradient-to-r from-background-secondary to-background-tertiary/20`}
                            >
                                {/* Left: Key Metric */}
                                <div className="w-full md:w-48 text-center md:text-left md:border-r border-border-subtle md:pr-6 shrink-0">
                                    <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-2">3Y CAGR (Audited)</p>
                                    <p className="text-4xl font-bold text-success flex items-center justify-center md:justify-start gap-2">
                                        {strategy.cagr} <TrendingUp size={24} />
                                    </p>
                                    <span className={`inline-block mt-4 px-3 py-1 rounded text-[10px] font-bold uppercase border ${strategy.risk === 'Low' ? 'border-success/30 text-success bg-success/10' :
                                            strategy.risk === 'Medium' ? 'border-warning/30 text-warning bg-warning/10' :
                                                'border-error/30 text-error bg-error/10'
                                        }`}>
                                        {strategy.risk} Risk
                                    </span>
                                </div>

                                {/* Center: Details */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold group-hover:text-white text-text-primary transition-colors mb-1">{strategy.name}</h2>
                                            <p className="text-xs text-text-secondary flex items-center gap-2">
                                                By <span className="text-accent-secondary font-bold">{strategy.manager}</span> • {strategy.type}
                                            </p>
                                        </div>
                                        {strategy.status !== 'Neutral' && (
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 border ${strategy.status === 'Perfect Match' ? 'bg-success/20 text-success border-success/30' : 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30'
                                                }`}>
                                                <CheckCircle2 size={14} /> {strategy.status}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-text-muted leading-relaxed max-w-xl">
                                        {strategy.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {strategy.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-background-tertiary rounded text-[10px] font-bold text-text-secondary border border-border-subtle">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right: Action */}
                                <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-4 shrink-0">
                                    <div className="text-center md:text-right">
                                        <p className="text-[10px] uppercase text-text-muted font-bold tracking-widest">Min. Investment</p>
                                        <p className="text-lg font-bold">{strategy.minInv}</p>
                                    </div>
                                    <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary font-bold text-xs flex items-center justify-center gap-2 group-hover:bg-accent-primary group-hover:text-white transition-all">
                                        Analyze Deep <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredStrategies.length === 0 && (
                        <div className="p-12 text-center text-text-muted border border-dashed border-border-subtle rounded-2xl bg-background-tertiary/20">
                            <ShieldAlert size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-sm font-bold">No strategies match this specific risk profile.</p>
                            <button onClick={() => setSelectedRisk("All")} className="mt-4 text-xs text-accent-secondary underline">Clear Filters</button>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                    <PieChart size={16} /> Compare up to 3 strategies side-by-side using the <span className="text-white font-bold underline cursor-pointer">Advanced Screener</span>.
                </div>
            </main>
        </div>
    );
}
