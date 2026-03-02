"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    TrendingUp,
    Star,
    Award,
    ShieldCheck,
    Lock,
    Unlock,
    ArrowUpRight,
    Target,
    Users,
    CheckCircle2,
    Zap,
    Cpu,
    Activity
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

export default function CareerLadder() {
    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-12 relative overflow-hidden">
            <SectionHighlight className="top-[-10%] right-[-10%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] left-[-5%]" color="cyan" />

            <header className="mb-20 max-w-7xl mx-auto text-center w-full relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-premium-gradient flex items-center justify-center shadow-neon-glow">
                        <Trophy size={40} />
                    </div>
                </div>
                <h1 className="text-6xl font-black tracking-tighter mb-4 uppercase">Professional <span className="text-transparent bg-clip-text bg-premium-gradient">Nexus</span> Ladder</h1>
                <p className="text-xl text-text-secondary font-medium italic">
                    Current Operational Rank: <span className="text-white font-black uppercase tracking-widest text-base ml-2">Gold Partner</span>
                </p>
            </header>

            <main className="max-w-7xl mx-auto w-full space-y-16 relative z-10 px-4">

                {/* Current Mandate Tracker */}
                <div className="p-12 rounded-[40px] bg-white/[0.03] border border-white/5 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-[0.02] transition-opacity duration-700" />
                    <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none select-none group-hover:opacity-10 transition-opacity">
                        <Trophy size={300} />
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
                        <div className="flex-1 space-y-8">
                            <div>
                                <NeonBadge text="NEXT PROTOCOL UNLOCK: ELITE STATUS" className="mb-4" icon={Zap} />
                                <div className="flex items-baseline gap-4 mb-4">
                                    <p className="text-6xl font-black tracking-tighter text-white">₹92.4 <span className="text-2xl text-text-muted">Cr</span></p>
                                    <p className="text-sm text-text-muted font-bold uppercase tracking-widest pb-1">/ ₹100 Cr AUM Mandate</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2 border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '92.4%' }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                        className="h-full bg-premium-gradient shadow-neon-glow"
                                    />
                                </div>
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity size={12} className="text-accent-secondary" />
                                    Delta: ₹7.6 Cr AUM to unlock AI Priority Lead Routing & Fiduciary Multi-sig.
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0 p-8 rounded-3xl bg-black/40 border border-white/5 text-center min-w-[250px] group-hover:border-accent-secondary/30 transition-colors">
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-text-muted mb-4">Alpha Performance</p>
                            <div className="flex items-center justify-center gap-3">
                                <p className="text-5xl font-black text-success tracking-tighter">
                                    +14.2%
                                </p>
                                <div className="p-2 rounded-lg bg-success/10 text-success">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                            <p className="text-[9px] font-bold text-text-muted uppercase mt-4 tracking-widest">Verified Broker Feed</p>
                        </div>
                    </div>
                </div>

                {/* Performance Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Registered Node */}
                    <GlassCard className="p-10 border-white/5 relative group hover:border-white/20 transition-all opacity-60">
                        <div className="absolute top-6 right-6 text-success opacity-80">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted mb-8">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Registered</h3>
                        <p className="text-[10px] font-black text-text-muted mb-8 tracking-[0.2em]">NODE I: ₹0 - ₹20 Cr AUM</p>

                        <ul className="space-y-6">
                            {[
                                "Standard Portfolio Listing",
                                "Core Strategy Analytics",
                                "Ecosystem Network Access"
                            ].map((feat, i) => (
                                <li key={i} className="text-[11px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-3">
                                    <Unlock size={14} className="text-success shrink-0" /> {feat}
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* Gold Partner (Current Active) */}
                    <GlassCard className="p-10 border-accent-secondary bg-accent-secondary/5 relative transform md:-translate-y-6 shadow-neon-glow !shadow-accent-secondary/10" neon>
                        <div className="absolute top-6 right-6">
                            <NeonBadge text="ACTIVE NODE" color="purple" />
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-premium-gradient flex items-center justify-center text-white mb-8 shadow-neon-glow">
                            <Star size={32} />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Gold Partner</h3>
                        <p className="text-[10px] font-black text-accent-secondary mb-6 tracking-[0.2em]">NODE II: ₹20 - ₹100 Cr AUM</p>

                        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl mb-8 flex text-[9px] font-black items-center gap-3 text-white uppercase tracking-widest leading-relaxed">
                            <Target size={16} className="text-accent-secondary shrink-0" />
                            Requirement: Verified +5% Alpha over NIFTY500 Index.
                        </div>

                        <ul className="space-y-6">
                            {[
                                "Featured Marketplace Ranking",
                                "Advanced Institutional Quant Suite",
                                "High-Intent Lead Injection",
                                "Up to 50 active mandates"
                            ].map((feat, i) => (
                                <li key={i} className="text-[11px] text-white font-black uppercase tracking-widest flex items-center gap-3">
                                    <Unlock size={14} className="text-success shrink-0" /> {feat}
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* Elite Hegemony (Locked) */}
                    <GlassCard className="p-10 border-white/5 bg-black/20 relative group hover:border-warning/30 transition-all opacity-80 grayscale-[0.5]">
                        <div className="absolute top-6 right-6 text-text-muted/40">
                            <Lock size={24} />
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-warning mb-8">
                            <Award size={28} />
                        </div>
                        <h3 className="text-2xl font-black text-white/60 mb-2 uppercase tracking-tight">Elite Partner</h3>
                        <p className="text-[10px] font-black text-text-muted mb-8 tracking-[0.2em]">NODE III: ₹100 Cr+ AUM</p>

                        <ul className="space-y-6">
                            {[
                                "AI Priority Lead Routing",
                                "Fiduciary Multi-sig Vault",
                                "White-label Client Interface",
                                "Direct Institutional API Node"
                            ].map((feat, i) => (
                                <li key={i} className="text-[11px] text-text-muted/60 font-bold uppercase tracking-widest flex items-center gap-3 border-b border-white/5 pb-4">
                                    <Lock size={14} className="shrink-0 opacity-40" /> {feat}
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                </div>

                {/* Scale Acceleration */}
                <div className="flex flex-col lg:flex-row items-center justify-between p-10 rounded-[32px] bg-white/[0.03] border border-white/5 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-8 relative z-10 mb-8 lg:mb-0">
                        <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center text-success shadow-[0_0_20px_rgba(0,230,118,0.1)]">
                            <Users size={32} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black uppercase tracking-tight">Accelerate Your Alpha</h4>
                            <p className="text-sm text-text-muted font-medium">Join the monthly Mentor Masterclass on scaling AUM via institutional mandates.</p>
                        </div>
                    </div>
                    <PremiumButton variant="secondary" className="scale-90 flex items-center gap-3 uppercase tracking-widest text-[10px] relative z-10">
                        Join Symposium <ArrowUpRight size={18} />
                    </PremiumButton>
                </div>

            </main>

            <div className="mt-24 text-center opacity-30">
                <div className="flex justify-center items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em]">
                    <Cpu size={14} /> Ecosystem Meritocracy Framework v9.4 <ShieldCheck size={14} />
                </div>
            </div>
        </div>
    );
}
