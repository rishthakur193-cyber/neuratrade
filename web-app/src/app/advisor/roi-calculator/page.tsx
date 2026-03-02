"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Calculator,
    TrendingUp,
    Users,
    Briefcase,
    ChevronRight,
    Zap,
    BarChart4,
    ShieldCheck,
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

export default function ROICalculator() {
    const [clients, setClients] = useState(25);
    const [avgAUM, setAvgAUM] = useState(50); // in Lakhs
    const [feePercentage, setFeePercentage] = useState(1.5); // %

    const totalAUM = (clients * avgAUM) / 100; // in Crores
    const grossRevenue = (totalAUM * (feePercentage / 100)) * 100; // in Lakhs
    const platformFee = grossRevenue * 0.10; // 10% platform fee
    const netTakeHome = grossRevenue - platformFee;

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-12 relative overflow-hidden">
            <SectionHighlight className="top-[-10%] left-[-5%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] right-[-5%]" color="cyan" />

            <header className="mb-20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative z-10 px-4">
                <div className="space-y-4">
                    <NeonBadge text="REVENUE PROJECTION ENGINE v4.2" className="mb-4" icon={Cpu} />
                    <h1 className="text-6xl font-black tracking-tighter leading-tight">
                        Nexus <span className="text-transparent bg-clip-text bg-premium-gradient">Yield</span> Calculator
                    </h1>
                    <p className="text-xl text-text-secondary font-medium italic">Architecting your professional scale on the Ecosystem.</p>
                </div>
                <div className="flex gap-4">
                    <PremiumButton variant="secondary" className="scale-90 uppercase tracking-widest text-[10px]">
                        Download Pro-Forma
                    </PremiumButton>
                    <PremiumButton variant="primary" className="scale-90 uppercase tracking-widest text-[10px]">
                        Upgrade Tier
                    </PremiumButton>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 px-4">

                {/* Simulation Matrix */}
                <div className="space-y-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4 pl-2">Simulation Matrix</h2>
                    <GlassCard className="p-10 border-white/5" neon>
                        <div className="space-y-12">
                            {/* Input 1: Client Capacity */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-accent-secondary uppercase tracking-widest flex items-center gap-2">
                                            <Users size={14} /> Client Capacity
                                        </p>
                                        <h3 className="text-3xl font-black tracking-tighter">{clients} <span className="text-xs text-text-muted uppercase">Families Managed</span></h3>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-text-muted uppercase tracking-widest">
                                        Max 500
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="500"
                                    value={clients}
                                    onChange={(e) => setClients(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-accent-secondary cursor-pointer"
                                />
                            </div>

                            {/* Input 2: Per-Capita AUM */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-accent-cyan uppercase tracking-widest flex items-center gap-2">
                                            <Briefcase size={14} /> Mandate Size
                                        </p>
                                        <h3 className="text-3xl font-black tracking-tighter">₹{avgAUM} <span className="text-xs text-text-muted uppercase">Avg. Lakhs / Node</span></h3>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-text-muted uppercase tracking-widest">
                                        Retail - HNI
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="500"
                                    step="5"
                                    value={avgAUM}
                                    onChange={(e) => setAvgAUM(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-accent-cyan cursor-pointer"
                                />
                            </div>

                            {/* Input 3: Fee Protocol */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-success uppercase tracking-widest flex items-center gap-2">
                                            <Target size={14} /> Fee Protocol
                                        </p>
                                        <h3 className="text-3xl font-black tracking-tighter">{feePercentage.toFixed(1)}% <span className="text-xs text-text-muted uppercase">Management Fee</span></h3>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-text-muted uppercase tracking-widest">
                                        SEBI Compliance Cap
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.5"
                                    step="0.1"
                                    value={feePercentage}
                                    onChange={(e) => setFeePercentage(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-success cursor-pointer"
                                />
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Projection Output */}
                <div className="space-y-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4 pl-2">Economic Forecast</h2>
                    <div className="p-12 rounded-[40px] bg-white/[0.03] border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                        <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700" />
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BarChart4 size={180} />
                        </div>

                        <div className="relative z-10 mb-16">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-4">Total Aggregate Mandate (AUM)</p>
                            <h3 className="text-7xl font-black tracking-tighter mb-2">
                                ₹{totalAUM.toFixed(2)} <span className="text-3xl text-text-muted uppercase tracking-widest">Cr</span>
                            </h3>
                            <div className="flex items-center gap-2 text-accent-cyan">
                                <Activity size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Scale Projection</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10 pt-12 border-t border-white/5 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">Gross Yield (Lakhs)</p>
                                <p className="text-3xl font-black text-white tracking-tighter">₹{grossRevenue.toFixed(1)}L</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted">Net Professional Fee (Lakhs)</p>
                                <p className="text-3xl font-black text-success tracking-tighter shadow-neon-glow-success">₹{netTakeHome.toFixed(1)}L</p>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center justify-between p-6 rounded-3xl bg-black/40 border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted italic text-xs font-black">
                                    10%
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted max-w-[120px]">Ecosystem Infrastructure Fee</p>
                            </div>
                            <button className="text-[9px] font-black uppercase tracking-widest text-accent-secondary hover:underline underline-offset-4">Economics Charter</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard className="p-8 border-white/5 group hover:border-accent-secondary/30 transition-all">
                            <h4 className="text-xs font-black mb-3 uppercase tracking-widest">Growth Accelerator</h4>
                            <p className="text-[10px] text-text-muted font-medium mb-6 leading-relaxed">Scale your practice with our AI-powered lead generation node. Targeted HNI matches delivered daily.</p>
                            <button className="text-[10px] font-black uppercase text-accent-secondary flex items-center gap-2 group-hover:gap-3 transition-all">Enable Alpha Engine <ChevronRight size={14} /></button>
                        </GlassCard>
                        <GlassCard className="p-8 border-white/5 group hover:border-accent-cyan/30 transition-all">
                            <h4 className="text-xs font-black mb-3 uppercase tracking-widest">Fiduciary Shield</h4>
                            <p className="text-[10px] text-text-muted font-medium mb-6 leading-relaxed">Automate SEBI compliance, audit trails, and fiduciary reporting with the Integrated Compliance Hub.</p>
                            <button className="text-[10px] font-black uppercase text-accent-cyan flex items-center gap-2 group-hover:gap-3 transition-all">View Compliance <ChevronRight size={14} /></button>
                        </GlassCard>
                    </div>
                </div>

            </main>

            <div className="mt-24 text-center opacity-20 relative z-10">
                <div className="flex justify-center items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em]">
                    <span className="flex items-center gap-2"><Lock size={12} /> SECURE CRYPTOGRAPHY</span>
                    <span className="flex items-center gap-2"><ShieldCheck size={12} /> SEBI AUDITED</span>
                    <span className="flex items-center gap-2"><Cpu size={12} /> AI PROJECTED</span>
                </div>
            </div>
        </div>
    );
}
