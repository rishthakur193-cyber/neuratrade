"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    Users,
    Wallet,
    Bell,
    PieChart,
    TrendingUp,
    ArrowUpRight,
    Plus,
    ArrowDownRight,
    ShieldCheck,
    Calendar,
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronRight,
    Activity,
    Target,
    Zap,
    Briefcase
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

export default function AdvisorDashboard() {
    const [userData, setUserData] = useState<any>(null);
    const [clientData, setClientData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/auth/login';
            return;
        }

        async function fetchData() {
            try {
                const userRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const user = await userRes.json();
                    setUserData(user);
                }

                const clientsRes = await fetch('/api/advisor/clients', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (clientsRes.ok) {
                    const data = await clientsRes.json();
                    setClientData(data.clients || []);
                }
            } catch (error) {
                console.error("Advisor Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const totalAUM = clientData.reduce((acc, client) => acc + (client.aum || 0), 0) || 185400000;
    const activeClientsCount = clientData.filter(c => c.status === 'ACTIVE').length || 1240;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
                <div className="text-accent-secondary animate-pulse font-black tracking-[0.3em] text-sm flex items-center gap-3">
                    <Activity size={20} /> SYNCING CRM INFRASTRUCTURE...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col p-8 space-y-10 relative z-20">
                <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-premium-gradient flex items-center justify-center shadow-neon-glow">
                        <Briefcase size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter leading-none">ECOSYSTEM</span>
                        <span className="text-[8px] font-bold text-accent-secondary tracking-[0.2em] uppercase">Advisor Mission Control</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    <SidebarItem icon={LayoutDashboard} label="Mission Control" active />
                    <SidebarItem icon={Users} label="Client Hub" />
                    <SidebarItem icon={PieChart} label="Strategy Builder" />
                    <SidebarItem icon={BarChart3} label="Compliance Vault" />
                    <SidebarItem icon={Calendar} label="Network Schedule" />
                </nav>

                <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="p-5 rounded-2xl bg-accent-secondary/5 border border-accent-secondary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2">
                            <ShieldCheck size={16} className="text-accent-secondary" />
                        </div>
                        <p className="text-[10px] text-accent-secondary font-bold uppercase tracking-widest mb-1">Advisor Tier</p>
                        <h4 className="text-sm font-black text-white">Elite Institutional</h4>
                        <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-secondary w-3/4" />
                        </div>
                    </div>
                    <SidebarItem icon={LogOut} label="Secure Sign Out" onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative bg-radial-highlights">
                {/* Header */}
                <header className="sticky top-0 z-30 flex justify-between items-center px-12 py-8 backdrop-blur-md bg-[#0B0B12]/60 border-b border-white/5">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1">
                            Mission <span className="text-transparent bg-clip-text bg-premium-gradient">Control</span>
                        </h1>
                        <p className="text-text-secondary text-sm font-medium">Hello, {userData?.name?.split(' ')[0] || 'Advisor'}. Your practice health is <span className="text-success font-bold">OPTIMAL</span>.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-[10px] font-bold tracking-widest text-text-secondary">SEBI VERIFIED</span>
                        </div>

                        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-secondary rounded-full shadow-[0_0_10px_rgba(179,136,255,0.8)]" />
                        </button>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/5">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-white">{userData?.name || 'Lead Advisor'}</p>
                                <p className="text-[10px] text-accent-secondary font-bold uppercase tracking-widest">INA100001234</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-premium-gradient p-[1px]">
                                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center font-black text-accent-secondary">
                                    {userData?.name ? userData.name[0].toUpperCase() : 'A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-12 space-y-12">
                    {/* KPI Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <KPICard label="Portfolio AUM" value={`₹${(totalAUM / 10000000).toFixed(1)} Cr`} change="+4.2%" trend="up" />
                        <KPICard label="Active Families" value={activeClientsCount.toString()} change="+12" trend="up" />
                        <KPICard label="Monthly Revenue" value={`₹${((totalAUM * 0.015) / 12 / 100000).toFixed(1)}L`} change="+8.5%" trend="up" />
                        <KPICard label="Alpha Generated" value={`+${userData?.profile?.alphaGenerated || '2.1'}%`} sub="vs NSE500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Performance Chart Mockup */}
                        <GlassCard className="lg:col-span-2 p-8 min-h-[450px] relative overflow-hidden group" neon>
                            <div className="flex justify-between items-center mb-10 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">PRACTICE PERFORMANCE</h3>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Global Asset Aggregation</p>
                                </div>
                                <div className="flex gap-2">
                                    {['1M', '3M', '1Y', 'YTD'].map(t => (
                                        <button key={t} className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest transition-all ${t === '1Y' ? 'bg-accent-secondary text-white shadow-neon-glow' : 'text-text-muted hover:text-white'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SVG Chart Visualization */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 px-8">
                                <svg width="100%" height="100%" viewBox="0 0 800 300" className="overflow-visible">
                                    <defs>
                                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#B388FF" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2.5, ease: "easeInOut" }}
                                        d="M0 250 C 100 230, 200 280, 300 180 C 400 100, 500 150, 600 80 C 700 30, 800 50, 800 50"
                                        fill="none"
                                        stroke="url(#chart-grad-line)"
                                        strokeWidth="4"
                                        className="drop-shadow-[0_0_15px_rgba(179,136,255,0.4)]"
                                    />
                                    <path d="M0 250 C 100 230, 200 280, 300 180 C 400 100, 500 150, 600 80 C 700 30, 800 50, 800 50 V 300 H 0 Z" fill="url(#chart-grad)" />
                                    <defs>
                                        <linearGradient id="chart-grad-line" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#7C4DFF" />
                                            <stop offset="100%" stopColor="#E040FB" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* Point indicators */}
                            <div className="absolute top-[40%] left-[60%] group-hover:scale-125 transition-transform">
                                <div className="w-3 h-3 rounded-full bg-accent-secondary border-2 border-white shadow-neon-glow" />
                                <div className="absolute top-[-30px] left-[-40px] bg-black/80 px-2 py-1 rounded text-[10px] font-black border border-white/10">
                                    ₹185.4 Cr
                                </div>
                            </div>
                        </GlassCard>

                        {/* High Intent Leads */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-2 uppercase tracking-widest">
                                <Zap className="text-accent-cyan" size={18} />
                                High Intent Leads
                            </h3>
                            <div className="space-y-4">
                                <LeadItem name="Amitabh Malhotra" profile="Institutional / Family Office" match={98} />
                                <LeadItem name="Saira Banu" profile="Global Tech Exec" match={94} />
                                <LeadItem name="Vikram Rathore" profile="Conservative Alpha" match={89} />
                            </div>
                            <PremiumButton variant="secondary" className="w-full">Open Marketplace Hub</PremiumButton>
                        </div>
                    </div>

                    {/* Lower Widgets */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Strategy Radar */}
                        <GlassCard className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black tracking-tight">ACTIVE STRATEGIES</h3>
                                <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 flex items-center justify-center text-accent-secondary cursor-pointer hover:bg-accent-secondary/20 transition-all">
                                    <Plus size={20} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <StrategyRow name="Quant-Alpha institutional" aum="₹42Cr" ret="+24.2%" risk="MOD" />
                                <StrategyRow name="Global Tech Composite" aum="₹28Cr" ret="+18.5%" risk="HIGH" />
                                <StrategyRow name="Yield Guard Bonds" aum="₹15Cr" ret="+9.2%" risk="LOW" />
                            </div>
                        </GlassCard>

                        {/* Revenue Estimator */}
                        <GlassCard className="p-8 bg-premium-gradient/5 relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-primary/10 rounded-full blur-[80px]" />
                            <h3 className="text-xl font-black tracking-tight mb-8">PRACTICE GROWTH MODEL</h3>
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                                        <span>Target AUM Managed</span>
                                        <span className="text-accent-secondary">₹500 Cr</span>
                                    </div>
                                    <input type="range" className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent-secondary" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 rounded-2xl bg-black/40 border border-white/5 transition-all hover:border-accent-secondary/30">
                                        <p className="text-[10px] text-text-muted font-bold uppercase mb-1">Est. Annual Rev</p>
                                        <p className="text-2xl font-black text-white">₹7.5 Cr</p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-black/40 border border-white/5 transition-all hover:border-accent-cyan/30">
                                        <p className="text-[10px] text-text-muted font-bold uppercase mb-1">Ecosystem Multiplier</p>
                                        <p className="text-2xl font-black text-accent-cyan">3.2x</p>
                                    </div>
                                </div>
                                <PremiumButton variant="primary" className="w-full">Apply for Tier Expansion</PremiumButton>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 relative group ${active
                    ? "bg-accent-secondary/10 text-white font-bold"
                    : "text-text-muted hover:text-white"
                }`}>
            {active && (
                <motion.div
                    layoutId="sidebar-active-advisor"
                    className="absolute left-0 w-1 h-6 bg-accent-secondary rounded-r-full shadow-[0_0_15px_rgba(179,136,255,0.6)]"
                />
            )}
            <Icon size={20} className={`${active ? 'text-accent-secondary' : 'group-hover:text-accent-secondary'} transition-colors`} />
            <span className="text-sm tracking-tight">{label}</span>
        </div>
    );
}

function KPICard({ label, value, change, trend, sub }: { label: string, value: string, change?: string, trend?: 'up' | 'down', sub?: string }) {
    return (
        <GlassCard className="p-7">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-3">{label}</p>
            <div className="flex items-end justify-between">
                <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
                {change && (
                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded ${trend === 'up' ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {change}
                    </div>
                )}
            </div>
            {sub && <p className="text-[10px] text-text-muted font-medium mt-1">{sub}</p>}
        </GlassCard>
    );
}

function LeadItem({ name, profile, match }: { name: string, profile: string, match: number }) {
    return (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-accent-cyan/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-black border border-accent-cyan/20">
                    {name[0]}
                </div>
                <div>
                    <span className="text-sm font-bold block">{name}</span>
                    <span className="text-[10px] text-text-muted font-medium italic">{profile}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-xs font-black text-accent-cyan">{match}%</span>
                <div className="w-16 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-accent-cyan" style={{ width: `${match}%` }} />
                </div>
            </div>
        </div>
    );
}

function StrategyRow({ name, aum, ret, risk }: { name: string, aum: string, ret: string, risk: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-accent-secondary rounded-full" />
                <div>
                    <span className="text-sm font-bold block">{name}</span>
                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">{aum} AUM</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-sm font-black text-success block">{ret}</span>
                <span className="text-[8px] font-black text-text-muted bg-white/5 px-2 py-0.5 rounded tracking-widest">{risk} RISK</span>
            </div>
        </div>
    );
}
