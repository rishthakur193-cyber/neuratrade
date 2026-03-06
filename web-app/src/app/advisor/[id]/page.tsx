
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    Award,
    ShieldCheck,
    TrendingUp,
    Users,
    Zap,
    MapPin,
    Calendar,
    ArrowUpRight,
    Star,
    CheckCircle2
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function AdvisorProfilePage() {
    const { id } = useParams();
    const [advisor, setAdvisor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch from /api/advisor/profile/[id]
        // For now, mock a professional profile based on ID
        setTimeout(() => {
            setAdvisor({
                id,
                name: "Vikram Malhotra",
                role: "Senior Quant Strategist",
                bio: "Specializing in algorithmic market-neutral strategies for HNIs and Institutional mandates. 15+ years of capital market experience.",
                rating: 4.9,
                trustScore: 982,
                aum: "₹450Cr+",
                clients: 124,
                metrics: {
                    winRate: "68%",
                    avgMonthlyReturn: "2.4%",
                    maxDrawdown: "-8.5%",
                    profitFactor: "1.45"
                },
                equityCurve: [
                    { date: 'Jan', balance: 100000 },
                    { date: 'Feb', balance: 102400 },
                    { date: 'Mar', balance: 105100 },
                    { date: 'Apr', balance: 104200 },
                    { date: 'May', balance: 108500 },
                    { date: 'Jun', balance: 112100 },
                ],
                registrations: ["SEBI INA000012345", "NISM Series XV"]
            });
            setLoading(false);
        }, 800);
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
            <Zap className="animate-pulse text-accent-secondary" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-8 md:p-12 relative overflow-hidden">
            <SectionHighlight className="top-[-10%] right-[-10%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] left-[-10%]" color="cyan" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-premium-gradient p-[1px]">
                            <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                                <Users size={32} className="text-white/80" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter">{advisor.name}</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-accent-secondary uppercase tracking-widest">{advisor.role}</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-success" /> Verified Fiduciary
                                </span>
                            </div>
                        </div>
                    </div>
                    <PremiumButton variant="secondary" onClick={() => window.history.back()} className="px-6 py-2 text-[10px] uppercase font-black">
                        Back to Marketplace
                    </PremiumButton>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Bio & Credentials */}
                    <div className="lg:col-span-2 space-y-12">
                        <GlassCard className="p-10 border-white/5" neon>
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-accent-secondary mb-6">Strategic Mandate</h2>
                            <p className="text-2xl font-medium leading-relaxed mb-8">
                                {advisor.bio}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {advisor.registrations.map((reg: string) => (
                                    <div key={reg} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                        <Award size={16} className="text-warning" />
                                        <span className="text-xs font-bold tracking-tight">{reg}</span>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <GlassCard className="p-8 border-white/5 text-center">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Win Rate</p>
                                <p className="text-4xl font-black text-success">{advisor.metrics.winRate}</p>
                            </GlassCard>
                            <GlassCard className="p-8 border-white/5 text-center">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Avg Monthly</p>
                                <p className="text-4xl font-black text-accent-cyan">{advisor.metrics.avgMonthlyReturn}</p>
                            </GlassCard>
                            <GlassCard className="p-8 border-white/5 text-center">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Max Drawdown</p>
                                <p className="text-4xl font-black text-danger">{advisor.metrics.maxDrawdown}</p>
                            </GlassCard>
                            <GlassCard className="p-8 border-white/5 text-center">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Profit Factor</p>
                                <p className="text-4xl font-black text-[#69F0AE]">{advisor.metrics.profitFactor}</p>
                            </GlassCard>
                        </div>

                        {/* Verified Equity Curve Chart */}
                        <GlassCard className="p-10 border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <div className="flex items-center gap-1 bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20">
                                    <ShieldCheck size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Broker Verified Trades</span>
                                </div>
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-accent-secondary mb-8">Verified Equity Curve</h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={advisor.equityCurve} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#69F0AE" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#69F0AE" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                            itemStyle={{ color: '#69F0AE', fontWeight: 'bold' }}
                                            formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Portfolio Value']}
                                        />
                                        <Area type="monotone" dataKey="balance" stroke="#69F0AE" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-10 border-white/5">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-accent-secondary mb-8">Active Portfolios</h2>
                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center group hover:border-accent-secondary/50 transition-all cursor-pointer">
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight mb-1">Algorithmic Nifty Momentum</h3>
                                        <p className="text-xs text-text-muted font-bold tracking-widest uppercase">Target: 15-20% CAGR | Risk: High</p>
                                    </div>
                                    <ArrowUpRight className="text-text-muted group-hover:text-accent-secondary transition-colors" />
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center group hover:border-accent-secondary/50 transition-all cursor-pointer">
                                    <div>
                                        <h3 className="text-lg font-black tracking-tight mb-1">Corporate Bonds Alpha</h3>
                                        <p className="text-xs text-text-muted font-bold tracking-widest uppercase">Target: 9-11% Yield | Risk: Low</p>
                                    </div>
                                    <ArrowUpRight className="text-text-muted group-hover:text-accent-secondary transition-colors" />
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column: Trust Card & Actions */}
                    <div className="space-y-10">
                        <GlassCard className="p-10 border-white/5 !bg-accent-secondary/5 border-accent-secondary/20" neon>
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 rounded-full bg-accent-secondary/10 border border-accent-secondary/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(124,77,255,0.2)]">
                                    <ShieldCheck size={40} className="text-accent-secondary" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight uppercase tracking-tighter">Nexus Trust Score</h3>
                                <p className="text-6xl font-black text-white mt-4">{advisor.trustScore}</p>
                                <p className="text-[10px] font-black text-accent-secondary uppercase tracking-[0.3em] mt-2">Elite Institutional Grade</p>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-white/10 text-center">
                                <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
                                    <span>AUM Managed</span>
                                    <span className="text-white">{advisor.aum}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
                                    <span>Active Clients</span>
                                    <span className="text-white">{advisor.clients} Families</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
                                    <span>Rating</span>
                                    <span className="text-warning flex items-center gap-1"><Star size={14} fill="currentColor" /> {advisor.rating}</span>
                                </div>
                            </div>

                            <div className="mt-12 space-y-4">
                                <PremiumButton variant="primary" className="w-full py-4 text-sm font-black shadow-neon-glow">
                                    Initialize Mandate Discussion
                                </PremiumButton>
                                <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                                    Download Fiduciary Disclosure
                                </button>
                            </div>
                        </GlassCard>

                        <div className="p-8 rounded-3xl bg-black/40 border border-white/5 space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Platform Guarantees</h4>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 size={18} className="text-success shrink-0" />
                                <p className="text-[11px] font-medium text-text-secondary leading-relaxed pt-0.5">Fees are held in Ecosystem Escrow until mandate performance verification.</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <CheckCircle2 size={18} className="text-success shrink-0" />
                                <p className="text-[11px] font-medium text-text-secondary leading-relaxed pt-0.5">Advisor conflict disclosures are audited bi-annually by institutional nodes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
