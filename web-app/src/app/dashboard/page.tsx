"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    Shield,
    Map as MapIcon,
    Users,
    ArrowUpRight,
    Search,
    LayoutDashboard,
    Wallet,
    Settings,
    LogOut,
    Plus,
    Bell,
    ChevronRight,
    PieChart,
    Activity,
    Target,
    Zap
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";
import EcosystemMap from "../../components/EcosystemMap";
import { useMarketData } from "@/hooks/useMarketData";
import { MarketDecisionFeed } from "@/components/dashboard/MarketDecisionFeed";
import { ReferralDashboard } from "@/components/dashboard/ReferralDashboard";
import { SocialActivityFeed } from "@/components/dashboard/SocialActivityFeed";
import { OnboardingFunnel } from "@/components/dashboard/OnboardingFunnel";

export default function DashboardPage() {
    const [userData, setUserData] = useState<any>(null);
    const [portfolioData, setPortfolioData] = useState<any>(null);
    const [verifiedAdvisors, setVerifiedAdvisors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

    const { data: marketData, connected: wsConnected } = useMarketData(['RELIANCE', 'TATASTEEL', 'INFY', 'HDFCBANK']);

    useEffect(() => {
        const storedUser = localStorage.getItem('ecosystem_user');
        if (!storedUser) {
            window.location.href = '/auth/login';
            return;
        }
        const { token } = JSON.parse(storedUser);

        async function fetchData() {
            try {
                const userRes = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const user = await userRes.json();
                    setUserData(user);
                }

                const portRes = await fetch('/api/portfolio/overview', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (portRes.ok) {
                    const port = await portRes.json();
                    setPortfolioData(port);
                }

                const advRes = await fetch('/api/advisor-intelligence/discovery', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (advRes.ok) {
                    const adv = await advRes.json();
                    setVerifiedAdvisors(adv.slice(0, 3));
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
                <div className="text-accent-primary animate-pulse font-black tracking-[0.3em] text-sm flex flex-col items-center gap-4">
                    <Activity className="animate-spin text-accent-cyan" size={32} />
                    VERIFYING SECURE PROTOCOLS...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white flex overflow-hidden font-sans">
            <SectionHighlight className="top-[-10%] left-[-5%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] right-[-5%]" color="cyan" />

            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex-col p-8 space-y-12 relative z-20 overflow-y-auto custom-scrollbar hidden lg:flex">
                <div className="flex items-center gap-4 mb-2 group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-premium-gradient flex items-center justify-center shadow-neon-glow transform group-hover:rotate-6 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter leading-none italic uppercase">NeuraTrade</span>
                        <span className="text-[9px] font-black text-accent-cyan tracking-[0.3em] uppercase opacity-60">Elite Terminal</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-4">
                    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 opacity-40 px-6">Main Matrix</div>
                    <SidebarItem icon={LayoutDashboard} label="Mission Control" active />
                    <SidebarItem icon={Wallet} label="Global Portfolio" onClick={() => window.location.href = '/investor/portfolio'} />
                    <SidebarItem icon={MapIcon} label="Ecosystem Map" onClick={() => window.location.href = '/ecosystem'} />
                    <SidebarItem icon={Users} label="Verified Advisors" onClick={() => window.location.href = '/marketplace'} />
                    <SidebarItem icon={Target} label="Goal Tracking" onClick={() => window.location.href = '/investor/goals'} />
                </nav>

                <div className="space-y-4 pt-10 border-t border-white/5">
                    <SidebarItem icon={Settings} label="System Settings" />
                    <SidebarItem icon={LogOut} label="Secure Sign Out" onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }} />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative bg-radial-highlights custom-scrollbar">
                {/* Header */}
                <header className="sticky top-0 z-30 flex justify-between items-center px-6 lg:px-12 py-6 lg:py-10 backdrop-blur-xl bg-[#0B0B12]/40 border-b border-white/5">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-2xl lg:text-4xl font-black tracking-tighter mb-1.5 uppercase italic mt-4 lg:mt-0">
                            Salutations, <span className="text-transparent bg-clip-text bg-premium-gradient">{userData?.name?.split(' ')[0] || 'Investor'}</span>
                        </h1>
                        <p className="text-text-secondary text-[11px] font-black tracking-widest uppercase flex items-center gap-2 opacity-60">
                            <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-neon-glow-success" />
                            System Pulse: <span className="text-success font-bold">Optimal Integrity</span>
                        </p>
                    </motion.div>

                    <div className="flex items-center gap-4 lg:gap-8">
                        <div className="relative group hidden lg:block">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-secondary" size={18} />
                            <input
                                type="text"
                                placeholder="Query Nexus..."
                                className="bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-16 pr-8 text-xs font-bold tracking-widest focus:border-accent-secondary/50 outline-none w-64 transition-all focus:w-96 uppercase backdrop-blur-md"
                            />
                        </div>
                        <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-text-muted hover:text-white transition-all hover:bg-white/10 relative group">
                            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-2 lg:top-3 right-2 lg:right-3 w-2.5 h-2.5 bg-accent-tertiary rounded-full shadow-[0_0_12px_rgba(224,64,251,0.8)] border-2 border-[#0B0B12]" />
                        </button>
                        <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-[20px] lg:rounded-3xl bg-premium-gradient p-[1.5px] group cursor-pointer">
                            <div className="w-full h-full rounded-[18px] lg:rounded-3xl bg-black flex items-center justify-center font-black text-lg lg:text-xl text-accent-secondary group-hover:bg-white/5 transition-colors">
                                {userData?.name ? userData.name[0].toUpperCase() : 'I'}
                            </div>
                        </div>
                    </div>
                </header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-6 lg:p-12 space-y-10 lg:space-y-16"
                >
                    {/* Top Row: Portfolio & Quick Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <GlassCard className="p-12 flex flex-col justify-between min-h-[300px] relative overflow-hidden group" neon>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-accent-primary/10 transition-colors" />
                                <div className="flex flex-col lg:flex-row justify-between items-start relative z-10 gap-6 lg:gap-0">
                                    <div>
                                        <NeonBadge text="Consolidated Assets" color="cyan" className="mb-4 lg:mb-6" />
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-2 lg:mb-4 opacity-60">Gross Valuation</p>
                                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter italic">
                                            ₹{portfolioData?.portfolio?.totalValue?.toLocaleString('en-IN') || '42,85,200'}
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-success font-black text-2xl italic">
                                            <TrendingUp size={24} />
                                            <span>{portfolioData?.portfolio?.dailyChange >= 0 ? '+' : ''}{portfolioData?.portfolio?.dailyChange || 0}%</span>
                                        </div>
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mt-1 opacity-60">Delta / 30D</p>
                                    </div>
                                </div>

                                <div className="mt-8 lg:mt-12 grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 pt-8 lg:pt-10 border-t border-white/5 relative z-10" >
                                    <div>
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2 opacity-60">Risk Alpha</p>
                                        <span className="text-2xl font-black tracking-tight text-accent-cyan">{portfolioData?.portfolio?.riskScore || 0}%</span>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2 opacity-60">Fiduciary Grade</p>
                                        <span className="text-2xl font-black tracking-tight text-accent-secondary">{portfolioData?.portfolio?.totalValue > 500000 ? 'AA+' : 'A'}</span>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2 opacity-60">Sharpe Delta</p>
                                        <span className="text-2xl font-black tracking-tight text-white">1.82</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        <div className="grid grid-rows-2 gap-6 h-full">
                            <motion.div variants={itemVariants}>
                                <KPISmallCard
                                    icon={Shield}
                                    label="Security Protocol"
                                    value={userData?.twoFactorEnabled ? "HARDENED (2FA)" : "STANDARD"}
                                    color={userData?.twoFactorEnabled ? "success" : "warning"}
                                    onClick={() => !userData?.twoFactorEnabled && setIs2FAModalOpen(true)}
                                />
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <KPISmallCard icon={Activity} label="Dynamic Exposure" value="MODERATE" color="accent-primary" />
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants}>
                            <ReferralDashboard />
                        </motion.div>
                    </div>

                    {/* Middle Section: Nexus & Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <GlassCard className="p-6 lg:p-10 overflow-hidden relative min-h-[400px] lg:min-h-[500px] group">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 lg:mb-12 relative z-10 gap-4 lg:gap-0">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter uppercase italic">Institutional Nexus</h3>
                                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Neural Network Topology / Global Sync</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <PremiumButton variant="secondary" className="scale-75 origin-right uppercase tracking-[0.2em] text-[10px]">Matrix Logs</PremiumButton>
                                        <PremiumButton variant="primary" className="scale-75 origin-right uppercase tracking-[0.2em] text-[10px] shadow-neon-glow">Live View</PremiumButton>
                                    </div>
                                </div>

                                <div className="absolute inset-0 top-12 lg:top-24 opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity duration-1000 scale-110">
                                    <EcosystemMap />
                                </div>

                                <div className="absolute bottom-6 right-6 lg:top-40 lg:right-10 lg:bottom-auto space-y-4 lg:space-y-6 relative z-10">
                                    <OverlayData
                                        label="Primary Vector"
                                        value={marketData[0] ? `₹${marketData[0].ltp}` : "SYNCHING..."}
                                        delta={marketData[0]?.change}
                                    />
                                    <OverlayData
                                        label="Network Pulse"
                                        value={wsConnected ? "CONNECTED" : "OFFLINE"}
                                        color={wsConnected ? "cyan" : "danger"}
                                    />
                                    <OverlayData label="Latency Index" value="0.02 MS" />
                                </div>
                            </GlassCard>
                        </motion.div>

                        <div className="space-y-8">
                            <OnboardingFunnel userType={userData?.role || 'INVESTOR'} />

                            <h3 className="text-xl font-black tracking-tighter flex items-center gap-4 uppercase italic">
                                <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                                    <Zap size={18} className="animate-pulse" />
                                </div>
                                Neural Insights
                            </h3>
                            <div className="space-y-6">
                                <InsightCard title="STRATEGIC REBALANCING" desc="Your allocation in Renewable Energy is 12.4% above benchmark. Recommend liquidation for Alpha." type="INTELLIGENCE" />
                                <InsightCard title="SYSTEMIC VOLATILITY" desc="Historical volatility in SME mid-caps detected. VaR limit approaching institutional buffer." type="CRITICAL" urgent />
                                <InsightCard title="ALPHA IDENTIFIED" desc="Advisor Priya Singh's Debt Strategy has outperformed peers by 3.12% in the current cycle." type="OPPORTUNITY" />
                            </div>

                            <div className="mt-8">
                                <SocialActivityFeed />
                            </div>

                            <div className="mt-8 h-[600px] lg:h-auto">
                                <MarketDecisionFeed />
                            </div>
                        </div>
                    </div>

                    {/* Lower Section: Advisors & Order Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <motion.div variants={itemVariants}>
                            <GlassCard className="p-10 border-white/5">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter uppercase italic">Verified Fiduciaries</h3>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Connected Intelligence Network</p>
                                    </div>
                                    <div className="text-[10px] font-black text-accent-cyan cursor-pointer hover:text-white flex items-center gap-2 uppercase tracking-[0.3em] transition-colors">
                                        Open Marketplace <ChevronRight size={14} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {verifiedAdvisors.length > 0 ? (
                                        verifiedAdvisors.map((adv: any) => (
                                            <AdvisorRow key={adv.advisorId} name={adv.name} specialty={adv.strategyType || 'Quantitative Strategy'} trust={adv.compatibilityScore} />
                                        ))
                                    ) : (
                                        <div className="text-text-muted text-xs italic opacity-60">No Fiduciaries currently active.</div>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <OrderExecutionPanel symbols={['RELIANCE', 'TATASTEEL', 'INFY', 'HDFCBANK']} />
                        </motion.div>
                    </div>

                    {/* Bottom: Transaction Matrix */}
                    <motion.div variants={itemVariants}>
                        <GlassCard className="p-6 lg:p-10 border-white/5">
                            <div className="flex justify-between items-center mb-8 lg:mb-10">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic">Log Manifest</h3>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">Recent Ledger Activity</p>
                                </div>
                                <PremiumButton variant="secondary" className="scale-75 origin-right uppercase tracking-widest text-[9px]">View All</PremiumButton>
                            </div>
                            <div className="space-y-8">
                                {portfolioData?.transactions?.length > 0 ? (
                                    portfolioData.transactions.map((tx: any) => (
                                        <TransactionItem key={tx.id} symbol={tx.assetSymbol} name={tx.assetSymbol + " Asset"} amount={`₹${(tx.quantity * tx.price).toLocaleString('en-IN')}`} date={new Date(tx.date).toLocaleDateString()} status={tx.type === 'BUY' ? 'COMPLETED' : 'PROCESSED'} />
                                    ))
                                ) : (
                                    <div className="text-text-muted text-xs italic opacity-60">No recent transactions recorded.</div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>

                    <TwoFactorModal
                        isOpen={is2FAModalOpen}
                        onClose={() => setIs2FAModalOpen(false)}
                        onComplete={() => setUserData({ ...userData, twoFactorEnabled: true })}
                    />
                </motion.div>
            </main>
        </div>
    );
}

// Helper Components

function SidebarItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-5 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-500 relative group overflow-hidden ${active
                ? "bg-accent-primary/10 text-white font-black"
                : "text-text-muted hover:text-white"
                }`}>
            {active && (
                <>
                    <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 w-1 h-7 bg-premium-gradient rounded-r-full shadow-neon-glow"
                    />
                    <div className="absolute inset-0 bg-accent-primary/5 blur-xl -z-10" />
                </>
            )}
            <Icon size={20} className={`${active ? 'text-accent-primary' : 'group-hover:text-accent-secondary'} transition-all group-hover:scale-110`} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
        </div>
    );
}

function KPISmallCard({ icon: Icon, label, value, color, onClick }: { icon: any, label: string, value: string, color: string, onClick?: () => void }) {
    const colorMap = {
        success: 'text-success bg-success/10 shadow-neon-glow-success border-success/20',
        warning: 'text-warning bg-warning/10 shadow-neon-glow-warning border-warning/20',
        'accent-primary': 'text-accent-primary bg-accent-primary/10 shadow-neon-glow border-accent-primary/20',
    };

    const activeColor = colorMap[color as keyof typeof colorMap] || colorMap['accent-primary'];

    return (
        <GlassCard onClick={onClick} className="p-8 flex items-center gap-6 group hover:translate-x-2 transition-transform duration-500 cursor-pointer">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${activeColor} group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-1.5 opacity-60">{label}</p>
                <p className={`text-xl font-black tracking-tight ${color === 'success' ? 'text-success' : 'text-white'}`}>{value}</p>
            </div>
        </GlassCard>
    );
}

function OverlayData({ label, value, color = "cyan", delta }: { label: string, value: string, color?: string, delta?: string }) {
    const textColor = color === "danger" ? "text-danger" : "text-accent-cyan";
    const borderColor = color === "danger" ? "border-danger/30" : "border-white/10";

    return (
        <div className={`bg-black/80 backdrop-blur-2xl px-6 py-3 rounded-2xl border ${borderColor} inline-block shadow-2xl hover:border-accent-cyan/30 transition-colors`}>
            <span className={`text-[9px] font-black ${textColor} uppercase tracking-[0.3em] block mb-1 opacity-80 uppercase`}>{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-md font-black text-white italic tracking-tighter">{value}</span>
                {delta && (
                    <span className={`text-[10px] font-bold ${parseFloat(delta) >= 0 ? 'text-success' : 'text-danger'}`}>
                        {parseFloat(delta) >= 0 ? '+' : ''}{delta}%
                    </span>
                )}
            </div>
        </div>
    );
}

function InsightCard({ title, desc, type, urgent }: { title: string, desc: string, type: string, urgent?: boolean }) {
    return (
        <GlassCard className={`p-6 relative overflow-hidden group ${urgent ? 'border-danger/30 bg-danger/5 shadow-neon-glow-danger' : 'border-white/5 bg-white/[0.02]'} hover:scale-[1.02] transition-transform`}>
            {urgent && <div className="absolute top-0 left-0 w-1.5 h-full bg-danger shadow-neon-glow-danger" />}
            <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] font-black tracking-[0.1em] uppercase italic group-hover:text-accent-secondary transition-colors">{title}</span>
                <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${urgent ? 'bg-danger/20 text-danger' : 'bg-accent-primary/20 text-accent-primary'}`}>
                    {type}
                </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed font-medium italic opacity-80">{desc}</p>
        </GlassCard>
    );
}

function AdvisorRow({ name, specialty, trust }: { name: string, specialty: string, trust: number }) {
    return (
        <div className="flex items-center justify-between p-6 rounded-[28px] bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-accent-cyan/20 transition-all duration-500 cursor-pointer group hover:scale-[1.02]">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-premium-gradient flex items-center justify-center font-black text-lg shadow-neon-glow transform group-hover:rotate-6 transition-transform">
                    {name[0]}
                </div>
                <div>
                    <span className="text-md font-black block tracking-tight group-hover:text-accent-cyan transition-colors italic">{name}</span>
                    <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60 italic">{specialty}</span>
                </div>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-2 text-accent-cyan font-black text-[10px] justify-end uppercase tracking-[0.2em] mb-2 scale-90 origin-right opacity-60 group-hover:opacity-100 transition-opacity">
                    <Shield size={12} />
                    <span>{trust}% Match Vector</span>
                </div>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${trust}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="h-full bg-accent-cyan shadow-neon-glow-cyan"
                    />
                </div>
            </div>
        </div>
    );
}

function TransactionItem({ symbol, name, amount, date, status }: { symbol: string, name: string, amount: string, date: string, status: string }) {
    return (
        <div className="flex items-center justify-between group py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-accent-secondary font-black text-xs group-hover:border-accent-secondary/50 transition-all shadow-xl italic tracking-tighter">
                    {symbol}
                </div>
                <div>
                    <span className="text-md font-black block group-hover:text-accent-secondary transition-all italic tracking-tight">{name}</span>
                    <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-40">{date}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-lg font-black block tracking-tighter italic">{amount}</span>
                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${status === 'COMPLETED' ? 'text-success' : 'text-warning'}`}>{status}</span>
            </div>
        </div>
    );
}

function TwoFactorModal({ isOpen, onClose, onComplete }: { isOpen: boolean, onClose: () => void, onComplete: () => void }) {
    const [step, setStep] = useState(1);
    const [qrCode, setQrCode] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const startSetup = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/setup-2fa', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            setQrCode(data.qrCode);
            setStep(2);
        } catch (err) {
            setError("Failed to initialize security protocol.");
        } finally {
            setLoading(false);
        }
    };

    const verifySetup = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ code })
            });
            if (res.ok) {
                onComplete();
                onClose();
            } else {
                setError("Verification failed. Check your synchronizer.");
            }
        } catch (err) {
            setError("Linkage failure.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/60">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-[#0B0B12] border border-white/10 rounded-[32px] p-12 relative overflow-hidden shadow-2xl"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-premium-gradient" />

                <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-8">
                    Security <span className="text-accent-cyan">Hardening</span>
                </h2>

                {step === 1 ? (
                    <div className="space-y-8">
                        <p className="text-text-secondary text-sm leading-relaxed font-medium italic">
                            Enable Neural 2FA (TOTP) to protect your institutional assets. This will require a code from your authentication device during login.
                        </p>
                        <PremiumButton variant="primary" className="w-full py-5 shadow-neon-glow" onClick={startSetup} disabled={loading}>
                            {loading ? "INITIALIZING..." : "START LINKAGE SEQUENCE"}
                        </PremiumButton>
                    </div>
                ) : (
                    <div className="space-y-8 text-center">
                        <div className="bg-white p-4 rounded-3xl inline-block shadow-neon-glow-cyan border-4 border-accent-cyan/20">
                            {qrCode && <img src={qrCode} alt="Security QR" className="w-48 h-48" />}
                        </div>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] px-8">
                            Scan this vector with Google Authenticator or Authy to sync your synchronizer.
                        </p>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="XXXXXX"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-center font-black tracking-[0.5em] text-xl focus:border-accent-cyan/50 outline-none"
                            />
                            {error && <p className="text-danger text-[10px] font-black uppercase">{error}</p>}
                            <PremiumButton variant="primary" className="w-full py-5" onClick={verifySetup} disabled={loading}>
                                {loading ? "VERIFYING..." : "COMPLETE LINKAGE"}
                            </PremiumButton>
                        </div>
                    </div>
                )}

                <button onClick={onClose} className="absolute top-8 right-8 text-text-muted hover:text-white transition-colors">
                    <Plus size={24} className="rotate-45" />
                </button>
            </motion.div>
        </div>
    );
}

function OrderExecutionPanel({ symbols }: { symbols: string[] }) {
    const [selected, setSelected] = useState(symbols[0]);
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [status, setStatus] = useState("");
    const [analysis, setAnalysis] = useState<any>(null);

    const analyzeAsset = async () => {
        setAnalyzing(true);
        setAnalysis(null);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/ai/insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action: 'ASSET_ANALYSIS', payload: { symbol: selected } })
            });
            if (res.ok) {
                const data = await res.json();
                setAnalysis(data);
            } else {
                setStatus("ANALYSIS_FAILED");
            }
        } catch (err) {
            setStatus("CONDUIT_FAILURE");
        } finally {
            setAnalyzing(false);
        }
    };

    const executeTrade = async () => {
        setLoading(true);
        setStatus("");
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/portfolio/mock-trade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ symbol: selected, type, quantity: qty })
            });
            const data = await res.json();
            if (res.ok) setStatus("EXECUTION_ACKNOWLEDGED: " + data.orderId);
            else setStatus("EXECUTION_FAILED: " + data.error);
        } catch (err) {
            setStatus("CONDUIT_FAILURE");
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-10 border-white/5 h-full">
            <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-8 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-accent-secondary/20 flex items-center justify-center text-accent-secondary">
                    <Zap size={18} />
                </div>
                Direct Execution
            </h3>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setType('BUY')}
                        className={`py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${type === 'BUY' ? 'bg-success text-black shadow-neon-glow-success' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                    >
                        Long Vector
                    </button>
                    <button
                        onClick={() => setType('SELL')}
                        className={`py-3 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${type === 'SELL' ? 'bg-danger text-white shadow-neon-glow-danger' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                    >
                        Short Vector
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Instrument</label>
                    <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-accent-secondary/50 appearance-none"
                    >
                        {symbols.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex gap-4">
                    <PremiumButton
                        variant="secondary"
                        className="w-full py-3 text-[10px] tracking-widest uppercase border-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/10"
                        onClick={analyzeAsset}
                        disabled={analyzing}
                    >
                        {analyzing ? "ANALYZING..." : "8 Pillars Analysis"}
                    </PremiumButton>
                </div>

                <AnimatePresence>
                    {analysis && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 mt-2 text-left">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-xs font-black uppercase text-accent-secondary">AI Verdict (Score: {analysis.overallScore})</span>
                                </div>
                                <p className="text-[10px] text-white/80 italic font-medium leading-relaxed">{analysis.verdict}</p>

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <div>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Trend</p>
                                        <p className="text-[9px] text-white/70 line-clamp-2">{analysis.pillars?.trend}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Risk (VaR)</p>
                                        <p className="text-[9px] text-danger line-clamp-2">{analysis.pillars?.risk}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Momentum</p>
                                        <p className="text-[9px] text-white/70 line-clamp-2">{analysis.pillars?.momentum}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Smart Money</p>
                                        <p className="text-[9px] text-accent-cyan line-clamp-2">{analysis.pillars?.smartMoney}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-2">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] pl-1">Quantity</label>
                    <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-accent-secondary/50"
                    />
                </div>

                <PremiumButton
                    variant="primary"
                    className={`w-full py-4 text-xs shadow-neon-glow mt-4 ${type === 'SELL' ? 'from-danger to-[#8B0000]' : ''} ${analysis && analysis.overallScore < 50 ? 'opacity-50' : ''}`}
                    onClick={executeTrade}
                    disabled={loading}
                >
                    {loading ? "COMMITTING..." : `EXECUTE ${type} ORDER`}
                </PremiumButton>

                {status && (
                    <div className="text-[8px] font-black text-center uppercase tracking-[0.2em] opacity-60 animate-pulse mt-4">
                        {status}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
