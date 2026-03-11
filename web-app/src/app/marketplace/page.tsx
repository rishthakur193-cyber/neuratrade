"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users,
    ArrowUpRight,
    TrendingUp,
    Quote,
    Play,
    Search,
    Filter,
    ShieldCheck,
    Briefcase,
    ExternalLink,
    ChevronRight,
    Star,
    Award,
    CheckCircle2,
    Zap,
    Heart
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const successStories = [
    {
        name: "Rajesh Iyer",
        role: "Retiree",
        title: "From Portfolio Chaos to 18% Stable Growth",
        story: "I had assets scattered across 5 brokers. Neura's matching found me an advisor who consolidated everything into a custom index strategy.",
        growth: "24.2%",
        time: "18 Months",
        image: "https://ui-avatars.com/api/?name=RI&background=7C4DFF&color=fff",
    },
    {
        name: "Anjali Gupta",
        role: "Tech Professional",
        title: "Navigating the Mid-Cap Rally with AI Oversight",
        story: "My advisor used the Strategy Builder to hedge my aggressive mid-cap exposure during the 2024 volatility. My drawdown was 40% less than the NIFTY.",
        growth: "16.8%",
        time: "8 Months",
        image: "https://ui-avatars.com/api/?name=AG&background=00E5FF&color=fff",
    }
];

const marketplaceServices = []; // Placeholder for type support

export default function MarketplacePage() {
    const [advisors, setAdvisors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        async function fetchAdvisors() {
            try {
                const storedUser = localStorage.getItem('ecosystem_user');
                const token = storedUser ? JSON.parse(storedUser).token : null;

                const res = await fetch('/api/advisor-intelligence/discovery', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    setAdvisors(data);
                }
            } catch (error) {
                console.error("Marketplace Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAdvisors();
    }, []);

    const filteredAdvisors = advisors.filter(adv => {
        const matchesSearch = adv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            adv.strategyType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === "ALL" || adv.strategyType.toUpperCase() === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white selection:bg-accent-secondary/30">
            {/* Header / Nav Placeholder */}
            <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/40 border-b border-white/5 py-6 px-12 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-premium-gradient flex items-center justify-center shadow-neon-glow">
                        <TrendingUp size={18} />
                    </div>
                    <span className="font-black tracking-tighter text-xl cursor-pointer" onClick={() => window.location.href = '/'}>NEURATRADE</span>
                </div>
                <div className="flex gap-8 items-center">
                    <nav className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
                        <a href="/marketplace" className="text-white border-b border-accent-secondary pb-1">Marketplace</a>
                        <a href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
                    </nav>
                    <PremiumButton variant="secondary" className="scale-75 origin-right" onClick={() => window.location.href = '/dashboard'}>Launch Terminal</PremiumButton>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-44 pb-24 px-12 overflow-hidden">
                <SectionHighlight className="top-20 left-1/4" color="purple" />
                <SectionHighlight className="bottom-0 right-1/4" color="cyan" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <NeonBadge text="SEBI-REGISTERED PARTNER NETWORK" className="mb-6 mx-auto" icon={ShieldCheck} />
                        <h1 className="text-7xl font-black tracking-tighter mb-8 leading-[0.95] max-w-4xl mx-auto">
                            Discover The <span className="text-transparent bg-clip-text bg-premium-gradient">Nexus</span> of Wealth Intelligence.
                        </h1>
                        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 font-medium">
                            The definitive marketplace connecting high-net-worth individuals with the elite 0.1% of verified investment professionals.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-3xl mx-auto relative group"
                    >
                        <div className="absolute inset-0 bg-accent-secondary/10 blur-[100px] pointer-events-none group-hover:bg-accent-secondary/20 transition-all duration-700" />
                        <GlassCard className="p-1 border-white/10 group-focus-within:border-accent-secondary/50 transition-all duration-500 overflow-hidden">
                            <div className="flex items-center">
                                <div className="pl-8 pr-4">
                                    <Search className="text-text-muted group-focus-within:text-accent-secondary transition-colors" size={22} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by strategy, advisor name, or specific asset class..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent py-6 pr-8 text-lg outline-none font-medium placeholder:text-text-muted/50"
                                />
                                <div className="pr-4">
                                    <button className="bg-premium-gradient px-8 py-3 rounded-xl font-black text-sm shadow-neon-glow hover:scale-[1.02] transition-transform">
                                        FIND MATCH
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </section>

            {/* Success Stories Ribbon */}
            <section className="py-24 px-12 border-y border-white/5 bg-black/20 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <h2 className="text-4xl font-black tracking-tight mb-2 uppercase tracking-widest">Client Victories</h2>
                            <p className="text-text-secondary font-medium italic">High-fidelity outcomes verified on the Ecosystem Ledger.</p>
                        </div>
                        <button className="text-accent-secondary font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:translate-x-1 transition-transform">
                            View Audit Reports <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {successStories.map((story, i) => (
                            <GlassCard key={i} className="p-10 group hover:p-[41px] transition-all duration-500 relative overflow-hidden" neon>
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Quote size={80} />
                                </div>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-premium-gradient p-[2px] shadow-neon-glow">
                                        <div className="w-full h-full rounded-2xl bg-black overflow-hidden border border-white/10">
                                            <img src={story.image} alt={story.name} className="w-full h-full object-cover opacity-80" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black tracking-tight">{story.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-accent-secondary uppercase tracking-widest">{story.role}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase">Verified Portfolio</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-accent-secondary transition-colors">"{story.title}"</h3>
                                <p className="text-text-secondary text-sm leading-relaxed mb-10 font-medium">
                                    {story.story}
                                </p>

                                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
                                    <div>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">Growth</p>
                                        <div className="flex items-center gap-1 text-success font-black text-xl">
                                            <TrendingUp size={16} /> {story.growth}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">Timeline</p>
                                        <p className="text-xl font-black text-white">{story.time}</p>
                                    </div>
                                    <div className="flex justify-end items-center">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-secondary group-hover:bg-accent-secondary group-hover:text-white transition-all cursor-pointer">
                                            <Play size={20} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Grid */}
            <section className="py-24 px-12 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
                        <div>
                            <h2 className="text-4xl font-black tracking-tight mb-2 uppercase tracking-widest">Elite Services</h2>
                            <p className="text-text-secondary font-medium">Targeted investment mandates and institutional-grade wealth solutions.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
                                {['ALL', 'EQUITY', 'QUANT', 'ALT'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${filter === f ? 'bg-accent-secondary text-white' : 'text-text-muted hover:text-white'}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-24 text-accent-secondary animate-pulse uppercase tracking-[0.4em] font-black">
                            Synchronizing Verified Fiduciaries...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredAdvisors.map((adv, i) => (
                                <GlassCard key={adv.advisorId} className="p-8 group flex flex-col min-h-[500px] border-white/5 hover:border-accent-cyan/30 transition-all duration-500" neon>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                                            <Award size={24} />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1.5 text-xs font-black text-warning">
                                                <Star size={14} fill="currentColor" />
                                                {(adv.trustScore / 20).toFixed(1)}
                                            </div>
                                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mt-1">Trust Score: {adv.trustScore}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <span className="text-[10px] font-black text-accent-cyan uppercase tracking-[0.2em]">{adv.strategyType}</span>
                                        <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-accent-cyan transition-colors italic">{adv.name}</h3>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">SEBI: <span className="text-white">{adv.sebiRegNo || 'INA00001234'}</span></p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {adv.matchReasons?.map((reason: string) => (
                                            <span key={reason} className="px-3 py-1 rounded-lg bg-success/5 border border-success/10 text-[8px] font-black uppercase tracking-widest text-success">
                                                {reason}
                                            </span>
                                        )) || (
                                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-text-muted group-hover:text-white transition-colors">
                                                    Institutional Grade
                                                </span>
                                            )}
                                    </div>

                                    <div className="mt-auto space-y-6">
                                        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 group-hover:border-accent-cyan/20 transition-colors flex justify-between items-center relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Compatibility</p>
                                                <p className="text-xl font-black text-white">{adv.compatibilityScore}%</p>
                                            </div>
                                            <div className="text-right relative z-10">
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Avg Ret/M</p>
                                                <p className="text-sm font-black text-success tracking-tight">+{adv.avgMonthlyReturn}%</p>
                                            </div>
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/5 blur-3xl pointer-events-none" />
                                        </div>

                                        <PremiumButton
                                            variant="primary"
                                            className="w-full shadow-neon-glow !shadow-accent-cyan/20 hover:!shadow-accent-cyan/40"
                                            onClick={() => window.location.href = `/advisors/${adv.advisorId}`}
                                        >
                                            View Mandate & Profile
                                        </PremiumButton>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}

                    <div className="mt-24 text-center">
                        <div className="inline-flex flex-col items-center gap-6 max-w-2xl mx-auto px-10 py-12 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success relative z-10">
                                <ShieldCheck size={32} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-2 tracking-tight">STRICT FIDUCIARY STANDARDS</h3>
                                <p className="text-text-muted font-medium text-sm leading-relaxed">
                                    Every advisor on this marketplace is manually vetted. We verify SEBI registration status daily and enforce 100% transparency on conflict-of-interest disclosures.
                                </p>
                            </div>
                            <div className="flex gap-4 relative z-10">
                                <div className="px-5 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-text-muted">SEBI Verified</div>
                                <div className="px-5 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-text-muted">Independent Audit</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Placeholder */}
            <footer className="py-20 px-12 border-t border-white/5 text-center">
                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">&copy; 2026 ECOSYSTEM OF SMART INVESTING. ALL RIGHTS RESERVED.</p>
                <div className="mt-6 flex justify-center gap-8 text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">
                    <a href="#" className="hover:text-white transition-colors">Privacy Protocol</a>
                    <a href="#" className="hover:text-white transition-colors">Risk Disclosures</a>
                    <a href="#" className="hover:text-white transition-colors">Compliance Charter</a>
                </div>
            </footer>
        </div>
    );
}
