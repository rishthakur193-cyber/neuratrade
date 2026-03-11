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
import { RegulatoryDisclaimer } from "@/components/compliance/RegulatoryDisclaimer";

import { GrowthService, LeaderboardData } from "@/services/growth.service";
import { PerformanceService, PerformanceLeaderboardEntry } from "@/services/performance.service";

export default function PerformanceLeaderboard() {
    const [activeTab, setActiveTab] = React.useState<"ADVISORS" | "GROWTH">("ADVISORS");
    const [performanceData, setPerformanceData] = React.useState<PerformanceLeaderboardEntry[]>([]);
    const [growthData, setGrowthData] = React.useState<LeaderboardData | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        if (activeTab === "ADVISORS") {
            PerformanceService.getLeaderboard()
                .then(setPerformanceData)
                .catch(err => console.error("Failed to fetch performance data", err))
                .finally(() => setLoading(false));
        } else {
            GrowthService.getLeaderboard()
                .then(setGrowthData)
                .catch(err => console.error("Failed to fetch growth data", err))
                .finally(() => setLoading(false));
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-12 relative overflow-hidden">
            <SectionHighlight className="top-[-10%] left-[-5%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] right-[-5%]" color="cyan" />

            <div className="absolute top-40 left-1/2 -translate-x-1/2 z-20">
                <div className="flex bg-black/40 backdrop-blur-3xl border border-white/10 p-1.5 rounded-[32px] gap-2">
                    <button
                        onClick={() => setActiveTab("ADVISORS")}
                        className={`px-10 py-4 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'ADVISORS' ? 'bg-premium-gradient text-white shadow-neon-glow' : 'text-text-muted hover:text-white'}`}
                    >
                        Advisor Alpha
                    </button>
                    <button
                        onClick={() => setActiveTab("GROWTH")}
                        className={`px-10 py-4 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'GROWTH' ? 'bg-premium-gradient text-white shadow-neon-glow' : 'text-text-muted hover:text-white'}`}
                    >
                        Network Growth
                    </button>
                </div>
            </div>

            <header className="mb-24 text-center max-w-5xl mx-auto relative z-10 pt-24">
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
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-[400px] flex items-center justify-center"
                        >
                            <div className="w-12 h-12 border-4 border-accent-secondary border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                    ) : activeTab === "ADVISORS" ? (
                        <motion.div
                            key="advisors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-[48px] bg-white/[0.03] border border-white/5 overflow-hidden backdrop-blur-3xl shadow-2xl"
                        >
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.05] text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
                                            <th className="px-10 py-8 border-b border-white/5">Rank</th>
                                            <th className="px-10 py-8 border-b border-white/5">Identity Node</th>
                                            <th className="px-10 py-8 border-b border-white/5">Audited trades</th>
                                            <th className="px-10 py-8 border-b border-white/5">Verification %</th>
                                            <th className="px-10 py-8 border-b border-white/5">Badge Status</th>
                                            <th className="px-10 py-8 border-b border-white/5 text-right">Interlink</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {performanceData.map((advisor, i) => (
                                            <motion.tr
                                                key={advisor.advisorId}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group hover:bg-white/[0.05] transition-all duration-500 cursor-pointer"
                                            >
                                                <td className="px-10 py-8">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${i === 0 ? 'bg-premium-gradient text-white shadow-neon-glow' :
                                                        i === 1 ? 'bg-white/10 text-white/60 border border-white/10' :
                                                            i === 2 ? 'bg-white/5 text-white/40 border border-white/5' :
                                                                'bg-transparent text-text-muted'
                                                        }`}>
                                                        {i + 1}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-accent-secondary group-hover:shadow-neon-glow transition-all">
                                                            <Award size={28} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className="font-black text-base uppercase tracking-tight group-hover:text-accent-secondary transition-colors italic">{advisor.advisorName}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck size={14} className="text-success shadow-neon-glow-success" />
                                                                <span className="text-[9px] text-text-muted uppercase font-black tracking-widest">{advisor.sebiRegNo}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="font-black text-lg text-white font-mono tracking-tighter uppercase">{advisor.verifiedTradeCount} / {advisor.totalTradeCount}</div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3 text-success font-black text-2xl italic tracking-tighter">
                                                        {advisor.verificationPct.toFixed(1)}% <TrendingUp size={20} className="shadow-neon-glow-success" />
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${advisor.badgeLevel === 'PLATINUM' ? 'border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan shadow-neon-glow' :
                                                        advisor.badgeLevel === 'GOLD' ? 'border-warning/30 bg-warning/5 text-warning' :
                                                            'border-white/20 bg-white/5 text-white/60'
                                                        }`}>
                                                        {advisor.badgeLevel}
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
                        </motion.div>
                    ) : (
                        <motion.div
                            key="growth"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* Top Referrers */}
                            <GlassCard className="p-10 border-white/5 overflow-hidden" neon>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="p-4 rounded-2xl bg-accent-secondary/20 text-accent-secondary">
                                        <Zap size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter italic">Top Referrers</h3>
                                        <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Viral Network Growth</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {growthData?.topReferrers.map((ref, i) => (
                                        <div key={ref.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                                            <div className="flex items-center gap-5">
                                                <span className="text-2xl font-black text-white/20 italic">#{i + 1}</span>
                                                <h4 className="font-black text-lg uppercase tracking-tight">{ref.name}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-accent-secondary font-black text-xl italic">{ref.count} <span className="text-[9px] uppercase tracking-widest ml-1">Invites</span></div>
                                                <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">{ref.points} PTS</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            {/* Top Point Earners */}
                            <GlassCard className="p-10 border-white/5 overflow-hidden" neon>
                                <div className="flex items-center gap-5 mb-10">
                                    <div className="p-4 rounded-2xl bg-accent-cyan/20 text-accent-cyan">
                                        <Target size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter italic">Top Earners</h3>
                                        <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">Ecosystem XP Points</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {growthData?.topEarners.map((earner, i) => (
                                        <div key={earner.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                                            <div className="flex items-center gap-5">
                                                <span className="text-2xl font-black text-white/20 italic">#{i + 1}</span>
                                                <h4 className="font-black text-lg uppercase tracking-tight">{earner.name}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-accent-cyan font-black text-xl italic">{earner.points} <span className="text-[9px] uppercase tracking-widest ml-1">Points</span></div>
                                                <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">Level {earner.level}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                <div className="max-w-7xl mx-auto px-8 pb-10">
                    <RegulatoryDisclaimer type="performance" />
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
