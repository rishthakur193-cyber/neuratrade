"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    ShieldCheck,
    Search,
    Star,
    Filter,
    ChevronRight,
    TrendingUp,
    Award,
    Zap,
    ArrowRight
} from "lucide-react";

// Mock Advisor Data
const advisors = [
    {
        id: "a1",
        name: "Dr. Arvinder Singh",
        role: "Quant & Derivatives",
        match: 98,
        aum: "₹120Cr",
        experience: "15Y+",
        rating: 4.9,
        sharpe: 1.8,
        tags: ["High Growth", "Algo-Driven"],
    },
    {
        id: "a2",
        name: "Sarah Fernandes",
        role: "Bluechip Specialist",
        match: 92,
        aum: "₹85Cr",
        experience: "10Y+",
        rating: 4.8,
        sharpe: 1.6,
        tags: ["Conservative", "Dividends"],
    },
    {
        id: "a3",
        name: "Vikram Malhotra",
        role: "Midcap Alpha",
        match: 87,
        aum: "₹45Cr",
        experience: "8Y+",
        rating: 4.7,
        sharpe: 2.1,
        tags: ["Aggressive", "Alpha Focused"],
    }
];

export default function AdvisorMatching() {
    const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-background-primary text-white p-10">
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Zap className="text-accent-primary animate-pulse" size={32} />
                    AI Advisor Matcher
                </h1>
                <p className="text-text-secondary max-w-2xl">
                    Our proprietary algorithm has matched you with the top 2.3% of India's SEBI-registered advisors based on your risk profile and goal and 8 pillars of analysis.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Network View Placeholder - Left side */}
                <div className="lg:col-span-7 glass-panel p-8 border-border-subtle relative min-h-[500px] overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-accent-primary rounded-full" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-accent-primary/50 rounded-full" />
                    </div>

                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {/* Central Node (Investor) */}
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-24 h-24 rounded-full bg-accent-primary/20 border-2 border-accent-primary flex flex-col items-center justify-center text-center p-2 glow-violet"
                        >
                            <Users size={24} className="mb-1" />
                            <span className="text-[10px] font-bold uppercase">You</span>
                        </motion.div>

                        {/* Advisor Nodes */}
                        {advisors.map((advisor, i) => {
                            const angle = (i * (360 / advisors.length)) * (Math.PI / 180);
                            const radius = 150;
                            const x = radius * Math.cos(angle);
                            const y = radius * Math.sin(angle);

                            return (
                                <motion.div
                                    key={advisor.id}
                                    initial={{ opacity: 0, x: 0, y: 0 }}
                                    animate={{ opacity: 1, x, y }}
                                    whileHover={{ scale: 1.1, zIndex: 50 }}
                                    onClick={() => setSelectedAdvisor(advisor.id)}
                                    className={`absolute cursor-pointer w-20 h-20 rounded-full flex flex-col items-center justify-center text-center p-2 transition-all border ${selectedAdvisor === advisor.id
                                        ? "bg-accent-secondary border-white glow-violet"
                                        : "bg-background-tertiary border-border-subtle hover:border-accent-secondary"
                                        }`}
                                >
                                    <span className="text-[10px] font-bold">{advisor.match}%</span>
                                    <span className="text-[8px] text-text-muted leading-tight mt-1">{advisor.name.split(' ')[1]}</span>
                                </motion.div>
                            );
                        })}

                        {/* Dynamic Connection Lines (SVG) */}
                        <svg className="absolute inset-0 pointer-events-none w-full h-full">
                            {advisors.map((advisor, i) => {
                                // Placeholder for connection logic
                                return null;
                            })}
                        </svg>
                    </div>

                    <div className="absolute bottom-8 left-8 flex items-center gap-2 text-xs text-text-muted">
                        <ShieldCheck size={14} className="text-success" />
                        Verification Engine: Active & Auditing
                    </div>
                </div>

                {/* Advisor Details - Right side */}
                <div className="lg:col-span-5 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedAdvisor ? (
                            <motion.div
                                key={selectedAdvisor}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-panel p-8 border-accent-secondary/30 relative"
                            >
                                {(() => {
                                    const advisor = advisors.find(a => a.id === selectedAdvisor)!;
                                    return (
                                        <>
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold">{advisor.name}</h2>
                                                    <p className="text-accent-secondary font-medium">{advisor.role}</p>
                                                </div>
                                                <div className="bg-success/10 text-success px-3 py-1 rounded-full text-xs font-bold border border-success/20">
                                                    SEBI VERIFIED
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                <div className="bg-background-tertiary/50 p-4 rounded-xl border border-border-subtle">
                                                    <p className="text-[10px] text-text-muted uppercase mb-1">AUM Managed</p>
                                                    <p className="font-bold text-lg">{advisor.aum}</p>
                                                </div>
                                                <div className="bg-background-tertiary/50 p-4 rounded-xl border border-border-subtle">
                                                    <p className="text-[10px] text-text-muted uppercase mb-1">Sharpe Ratio</p>
                                                    <p className="font-bold text-lg text-success">{advisor.sharpe}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                <h4 className="text-xs font-semibold uppercase tracking-widest text-text-muted">Specializations</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {advisor.tags.map(tag => (
                                                        <span key={tag} className="px-3 py-1 rounded-lg bg-background-tertiary border border-border-subtle text-xs">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <button className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold hover:glow-violet transition-all flex items-center justify-center gap-2">
                                                Connect with {advisor.name.split(' ')[0]} <ArrowRight size={18} />
                                            </button>
                                        </>
                                    );
                                })()}
                            </motion.div>
                        ) : (
                            <div className="glass-panel p-10 border-border-subtle border-dashed flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                                <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4 text-text-muted">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Select an Advisor</h3>
                                <p className="text-sm text-text-muted max-w-xs">
                                    Click on an advisor node in the network map to view their verified performance tracking and credentials.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Quick Filters */}
                    <div className="glass-panel p-6 border-border-subtle">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold flex items-center gap-2">
                                <Filter size={16} className="text-accent-primary" />
                                Match Filters
                            </h4>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <span className="px-3 py-1.5 rounded-lg bg-accent-primary/20 text-accent-primary border border-accent-primary/30">Top Matches</span>
                            <span className="px-3 py-1.5 rounded-lg bg-background-tertiary border border-border-subtle text-text-muted hover:text-white cursor-pointer transition-all">Alpha Oriented</span>
                            <span className="px-3 py-1.5 rounded-lg bg-background-tertiary border border-border-subtle text-text-muted hover:text-white cursor-pointer transition-all">Risk Neutral</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
