"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    TrendingUp,
    ShieldCheck,
    Info,
    Search,
    Filter,
    ArrowUpRight,
    ChevronRight,
    BarChart3,
    Award,
    Zap,
    Cpu,
    Target,
    Activity,
    Lock
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const advisors = [
    { rank: 1, name: "Dr. Arvinder Singh", returns: "+28.4%", sharpe: 1.84, aum: "₹185 Cr", risk: "Moderate", badge: "Elite" },
    { rank: 2, name: "Sarah Fernandes", returns: "+24.2%", sharpe: 1.62, aum: "₹92 Cr", risk: "Low", badge: "Gold" },
    { rank: 3, name: "Vikram Malhotra", returns: "+31.8%", sharpe: 2.15, aum: "₹120 Cr", risk: "High", badge: "Elite" },
    { rank: 4, name: "Amitabh Shah", returns: "+19.5%", sharpe: 1.45, aum: "₹45 Cr", risk: "Moderate", badge: "Silver" },
    { rank: 5, name: "Riya Kapoor", returns: "+22.1%", sharpe: 1.58, aum: "₹68 Cr", risk: "Low", badge: "Silver" },
];

export default function PerformanceLeaderboard() {
    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-12 relative overflow-hidden">
            <SectionHighlight className="top-[-10%] left-[-5%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] right-[-5%]" color="cyan" />

            <header className="mb-24 text-center max-w-5xl mx-auto relative z-10 pt-16">
                <div className="flex justify-center mb-10">
                    <div className="w-24 h-24 rounded-[32px] bg-premium-gradient flex items-center justify-center shadow-neon-glow relative group">
                        <Trophy size={48} className="group-hover:scale-110 transition-transform" />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-[-10px] bg-accent-secondary/20 rounded-full blur-2xl"
                        />
                    </div>
                </div>
                <NeonBadge text="AUDITED PERFORMANCE PROTOCOL v3.2" className="mx-auto mb-8" icon={Lock} />
                <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-tight mb-8">
                    The <span className="text-transparent bg-clip-text bg-premium-gradient">Nexus</span> Alpha
                </h1>
                <p className="text-2xl text-text-secondary font-medium italic leading-relaxed max-w-3xl mx-auto">
                    Institutional-grade audit trails. Verified SEBI licenses. Zero-friction transparency.
                    Only the top 2.3% of validated advisors achieve Genesis ranking.
                </p>
            </header>

            {/* Global Metrics Relay */}
            <div className="max-w-7xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {[
                    { label: "Aggregate Mandate", value: "₹4,250 Cr", color: "cyan" },
                    { label: "Verified Alpha", value: "+8.4%", color: "success" },
                    { label: "Validated Nodes", value: "154", color: "purple" },
                    { label: "Threats Neutralized", value: "12,400+", color: "danger" },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-8 border-white/5 transition-all hover:border-white/20" neon>
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60`}>{stat.label}</p>
                        <h3 className="text-4xl font-black tracking-tighter italic">{stat.value}</h3>
                    </GlassCard>
                ))}
            </div>

            <main className="max-w-7xl mx-auto space-y-12 relative z-10">
                {/* Control Interlink */}
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-between bg-white/[0.03] p-10 rounded-[40px] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="flex-1 max-w-2xl w-full relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="INDEX SEARCH: NAME, MANDATE, OR RATIO..."
                            className="w-full bg-black/40 border border-white/10 rounded-[28px] py-5 pl-16 pr-8 outline-none focus:border-accent-cyan transition-all text-xs font-black tracking-widest uppercase"
                        />
                    </div>
                    <div className="flex gap-4 w-full lg:w-auto">
                        <PremiumButton variant="secondary" className="flex-1 lg:flex-none scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]">
                            <Filter size={18} /> Risk Protocol
                        </PremiumButton>
                        <PremiumButton variant="primary" className="flex-1 lg:flex-none scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] !shadow-accent-cyan/20">
                            <BarChart3 size={18} /> Neural Compare
                        </PremiumButton>
                    </div>
                </div>

                {/* Rank Matrix */}
                <div className="rounded-[48px] bg-white/[0.03] border border-white/5 overflow-hidden backdrop-blur-3xl shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.05] text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
                                    <th className="px-10 py-8 border-b border-white/5">Rank</th>
                                    <th className="px-10 py-8 border-b border-white/5">Identity Node</th>
                                    <th className="px-10 py-8 border-b border-white/5">Audited Alpha (1Y)</th>
                                    <th className="px-10 py-8 border-b border-white/5">Sharpe Efficiency</th>
                                    <th className="px-10 py-8 border-b border-white/5">Active Mandate (AUM)</th>
                                    <th className="px-10 py-8 border-b border-white/5">Risk Spectrum</th>
                                    <th className="px-10 py-8 border-b border-white/5 text-right">Interlink</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {advisors.map((advisor, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group hover:bg-white/[0.05] transition-all duration-500 cursor-pointer"
                                    >
                                        <td className="px-10 py-8">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${advisor.rank === 1 ? 'bg-premium-gradient text-white shadow-neon-glow' :
                                                    advisor.rank === 2 ? 'bg-white/10 text-white/60 border border-white/10' :
                                                        advisor.rank === 3 ? 'bg-white/5 text-white/40 border border-white/5' :
                                                            'bg-transparent text-text-muted'
                                                }`}>
                                                {advisor.rank}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-accent-secondary group-hover:shadow-neon-glow transition-all">
                                                    <Award size={28} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-base uppercase tracking-tight group-hover:text-accent-secondary transition-colors italic">{advisor.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck size={14} className="text-success shadow-neon-glow-success" />
                                                        <span className="text-[9px] text-text-muted uppercase font-black tracking-widest">SEBI Verified Node</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 text-success font-black text-2xl italic tracking-tighter">
                                                {advisor.returns} <TrendingUp size={20} className="shadow-neon-glow-success" />
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="font-black text-lg text-white font-mono tracking-tighter uppercase">{advisor.sharpe} <span className="text-[9px] text-text-muted ml-2">SR</span></div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="font-black text-lg text-white tracking-widest uppercase italic">{advisor.aum}</div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${advisor.risk === 'Low' ? 'border-success/30 bg-success/5 text-success shadow-neon-glow-success !shadow-success/10' :
                                                    advisor.risk === 'Moderate' ? 'border-warning/30 bg-warning/5 text-warning' :
                                                        'border-danger/30 bg-danger/5 text-danger'
                                                }`}>
                                                {advisor.risk}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-accent-secondary transition-all flex items-center justify-center group-hover:scale-110 shadow-lg border border-white/10">
                                                <ChevronRight size={24} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audit CTA */}
                <div className="p-16 rounded-[64px] bg-white/[0.03] border border-white/5 relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-premium-gradient opacity-[0.05] animate-pulse" />
                    <SectionHighlight className="top-1/2 left-1/2" color="purple" />

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12 text-center lg:text-left">
                        <div className="max-w-2xl space-y-6">
                            <h3 className="text-5xl font-black tracking-tighter uppercase italic">Institutional Listing</h3>
                            <p className="text-text-secondary text-lg font-medium leading-relaxed italic">
                                Initialize your audited performance badge. We synchronize directly with broker API nodes to validate 36 months of historical fiduciary data. Total verification cycle: 48 hours.
                            </p>
                            <div className="flex items-center gap-8 justify-center lg:justify-start">
                                <div className="flex items-center gap-3">
                                    <Cpu size={20} className="text-accent-cyan" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Audit v.9</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Activity size={20} className="text-success shadow-neon-glow-success" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Feed Analytics</span>
                                </div>
                            </div>
                        </div>
                        <PremiumButton variant="primary" className="px-16 py-6 rounded-[32px] text-base font-black uppercase tracking-widest shadow-neon-glow hover:scale-105 transition-all">
                            Initialize Audit Handshake
                        </PremiumButton>
                    </div>
                </div>

                <div className="flex items-center gap-4 justify-center text-text-muted text-[10px] font-black uppercase tracking-[0.5em] pb-16 opacity-30">
                    <ShieldCheck size={18} /> DATA SYNCHRONIZED VIA NSE/BSE REAL-TIME NODE FEED <Clock size={18} />
                </div>
            </main>
        </div>
    );
}

function Clock(props: any) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
