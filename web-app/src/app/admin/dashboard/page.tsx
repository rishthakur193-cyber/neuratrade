"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ShieldAlert,
    Users,
    BarChart3,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Globe,
    Zap,
    Settings,
    Bell,
    Search,
    ArrowUpRight,
    TrendingUp,
    Fingerprint,
    Activity,
    Lock,
    Cpu,
    Shield
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

export default function AdminDashboard() {
    const [userData, setUserData] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const userStr = localStorage.getItem('ecosystem_user');
        if (!userStr) return;
        const { token } = JSON.parse(userStr);
        try {
            const userRes = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userRes.ok) {
                const user = await userRes.json();
                if (user.role !== 'ADMIN') {
                    window.location.href = '/dashboard';
                    return;
                }
                setUserData(user);
            }

            const metricsRes = await fetch('/api/admin/metrics', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (metricsRes.ok) {
                const data = await metricsRes.json();
                setMetrics(data);
            }
        } catch (error) {
            console.error("Admin Dashboard Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (advisorProfileId: string) => {
        const userStr = localStorage.getItem('ecosystem_user');
        if (!userStr) return;
        const { token } = JSON.parse(userStr);
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ advisorProfileId })
            });
            if (res.ok) {
                fetchData();
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
                <div className="text-[#FF5252] animate-pulse font-black tracking-[0.3em] text-sm flex items-center gap-3">
                    <ShieldAlert size={20} /> INITIALIZING ROOT CLEARANCE...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col p-8 space-y-10 relative z-20">
                <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-danger flex items-center justify-center shadow-[0_0_20px_rgba(255,82,82,0.4)]">
                        <Lock size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter leading-none">ROOT CONTROL</span>
                        <span className="text-[8px] font-bold text-danger tracking-[0.2em] uppercase">Ecosystem Admin</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    <SidebarItem icon={Globe} label="Ecosystem Radar" active color="danger" />
                    <SidebarItem icon={CheckCircle} label="Verification Hub" badge="2" />
                    <SidebarItem icon={AlertTriangle} label="Fraud Monitoring" badge="HIGH" />
                    <SidebarItem icon={Users} label="Entity Management" />
                    <SidebarItem icon={BarChart3} label="Global Revenue" />
                    <SidebarItem icon={Fingerprint} label="System Audits" />
                </nav>

                <div className="pt-8 border-t border-white/5">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                        <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mb-2">Cloud Infrastructure</p>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            <span className="text-[10px] font-black text-success">ALL SYSTEMS GO</span>
                        </div>
                    </div>
                    <SidebarItem icon={Settings} label="Core Configuration" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative bg-radial-highlights">
                {/* Header */}
                <header className="sticky top-0 z-30 flex justify-between items-center px-12 py-8 backdrop-blur-md bg-[#0B0B12]/60 border-b border-white/5">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1">
                            System <span className="text-danger">Aegis</span>
                        </h1>
                        <p className="text-text-secondary text-sm font-medium">Monitoring {metrics?.systemUsers || 1500}+ entities across 48 network nodes.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search UUID / Hash..."
                                className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm focus:border-danger outline-none w-64 transition-all focus:w-80"
                            />
                        </div>

                        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-danger transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full shadow-[0_0_10px_rgba(255,82,82,0.8)]" />
                        </button>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/5">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-white">{userData?.name || 'Administrator'}</p>
                                <p className="text-[10px] text-danger font-bold uppercase tracking-widest">Global Root Override</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-danger p-[1px] shadow-[0_0_15px_rgba(255,82,82,0.3)]">
                                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center font-black text-danger">
                                    {userData?.name ? userData.name[0].toUpperCase() : 'AD'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-12 space-y-12">
                    {/* KPI Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <GlobalMetric label="Platform AUM" value={`₹${(metrics?.liveAUM / 10000000 || 2480).toFixed(1)} Cr`} change="+12.4%" />
                        <GlobalMetric label="Active Nodes" value={metrics?.systemUsers?.toString() || "1,240"} change="+84" />
                        <GlobalMetric label="Verified entities" value={metrics?.verifiedAdvisors?.toString() || "842"} change="SEBI-Synced" />
                        <GlobalMetric label="Network Yield" value="₹85.2L" change="+18.5%" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Verification Matrix */}
                        <GlassCard className="lg:col-span-2 p-8 min-h-[450px]" neon>
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">VERIFICATION PIPELINE</h3>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Awaiting Institutional Validation</p>
                                </div>
                                <PremiumButton variant="secondary" className="scale-75 origin-right">Review All</PremiumButton>
                            </div>

                            <div className="space-y-4">
                                {metrics?.verificationQueue?.length > 0 ? (
                                    metrics.verificationQueue.map((adv: any) => (
                                        <VerificationRow
                                            key={adv.id}
                                            name={adv.name}
                                            bio={adv.sebiRegNo}
                                            progress={100}
                                            onApprove={() => handleApprove(adv.id)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-text-muted text-xs uppercase tracking-widest py-8 text-center italic opacity-50">
                                        All entities verified. No pending items.
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        {/* Fraud Radar Live */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-2 uppercase tracking-widest text-[#FF5252]">
                                <Cpu className="animate-pulse" size={18} />
                                Fraud Radar
                            </h3>
                            <GlassCard className="p-0 border-danger/30 overflow-hidden" neon>
                                <div className="p-6 bg-danger/5 border-b border-danger/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield size={14} className="text-danger" />
                                        <span className="text-[10px] font-black tracking-widest uppercase">Live Threat Map</span>
                                    </div>
                                    <p className="text-xs text-text-secondary leading-relaxed font-medium">
                                        System scanning 248,390 transactions/sec for pattern anomalies.
                                    </p>
                                </div>
                                <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                                    {metrics?.alerts?.map((alert: any, i: number) => (
                                        <ThreatCard key={i} title={alert.type} message={alert.message} level={alert.level} />
                                    )) || (
                                            <>
                                                <ThreatCard title="ABNORMAL WITHDRAWAL" message="Node 482 flagged for 400% deviation from avg." level="HIGH" />
                                                <ThreatCard title="SEBI MISMATCH" message="Entity 'GrowthCapital' revoked INA status detected." level="HIGH" />
                                                <ThreatCard title="LATENCY ANOMALY" message="Possible bridge attack detected on channel 02." level="MOD" />
                                            </>
                                        )}
                                </div>
                                <div className="p-4">
                                    <button className="w-full py-3 rounded-xl bg-danger text-white font-black text-xs shadow-[0_0_15px_rgba(255,82,82,0.4)] hover:scale-[1.02] transition-transform">
                                        INITIATE SYSTEM LOCKDOWN
                                    </button>
                                </div>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Infrastructure Overview */}
                    <GlassCard className="p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">GLOBAL INFRASTRUCTURE</h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Network health & load distribution</p>
                            </div>
                            <div className="flex gap-4">
                                <InfraStat label="Latency" value="2.4ms" color="success" />
                                <InfraStat label="CPU Load" value="14.2%" color="success" />
                                <InfraStat label="Active Channels" value="482" color="accent-cyan" />
                            </div>
                        </div>

                        <div className="h-48 flex items-end gap-2 group">
                            {[20, 35, 25, 60, 45, 80, 50, 90, 70, 40, 60, 30, 85, 55, 95].map((h, i) => (
                                <div key={i} className="flex-1 bg-white/5 rounded-t-lg transition-all hover:bg-danger/40 relative group-hover:opacity-60 hover:!opacity-100" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-0 group-hover:opacity-100 uppercase">n-{i}</div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
}

function GlobalMetric({ label, value, change }: { label: string, value: string, change: string }) {
    return (
        <GlassCard className="p-6">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">{label}</p>
            <div className="flex items-end justify-between">
                <h3 className="text-2xl font-black tracking-tighter">{value}</h3>
                <span className="text-[10px] font-black text-success flex items-center gap-1">
                    {change} <ArrowUpRight size={12} />
                </span>
            </div>
        </GlassCard>
    );
}

function SidebarItem({ icon: Icon, label, active = false, badge = null, color = "accent-secondary" }: { icon: any, label: string, active?: boolean, badge?: string | null, color?: string }) {
    const activeClass = color === 'danger' ? 'bg-danger/10 text-white' : 'bg-accent-secondary/10 text-white';
    const borderClass = color === 'danger' ? 'bg-danger shadow-[0_0_15px_rgba(255,82,82,0.6)]' : 'bg-accent-secondary shadow-[0_0_15px_rgba(179,136,255,0.6)]';

    return (
        <div className={`flex items-center justify-between px-6 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 relative group ${active ? activeClass : "text-text-muted hover:text-white"
            }`}>
            {active && (
                <motion.div
                    layoutId="sidebar-active-admin"
                    className={`absolute left-0 w-1 h-6 ${borderClass} rounded-r-full`}
                />
            )}
            <div className="flex items-center gap-4">
                <Icon size={18} className={`${active ? (color === "danger" ? "text-danger" : "text-accent-secondary") : "group-hover:text-white"}`} />
                <span className="text-sm tracking-tight">{label}</span>
            </div>
            {badge && (
                <span className={`px-2 py-0.5 rounded text-[8px] font-black ${badge === 'HIGH' ? 'bg-danger text-white' : 'bg-accent-secondary text-white'}`}>
                    {badge}
                </span>
            )}
        </div>
    );
}

function VerificationRow({ name, bio, progress, onApprove }: { name: string, bio: string, progress: number, onApprove?: () => void }) {
    return (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black">
                    {name[0]}
                </div>
                <div>
                    <span className="text-sm font-bold block group-hover:text-danger tracking-tight transition-colors">{name}</span>
                    <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase">{bio}</span>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="hidden sm:block">
                    <div className="flex justify-between mb-2">
                        <span className="text-[8px] font-black text-text-muted uppercase">KyC</span>
                        <span className="text-[8px] font-black text-white">{progress}%</span>
                    </div>
                    <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-danger transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-all">
                        <XCircle size={16} />
                    </button>
                    <button onClick={onApprove} className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center hover:bg-success hover:text-white transition-all">
                        <CheckCircle size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ThreatCard({ title, message, level }: { title: string, message: string, level: string }) {
    const isHigh = level === 'HIGH';
    return (
        <div className={`p-4 rounded-xl border-l-4 ${isHigh ? 'border-danger bg-danger/5' : 'border-warning bg-warning/5'} space-y-2`}>
            <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${isHigh ? 'text-danger' : 'text-warning'}`}>{level} THREAT</span>
                <span className="text-[8px] font-bold text-text-muted uppercase">{title}</span>
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-text-secondary">{message}</p>
        </div>
    );
}

function InfraStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="text-right">
            <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">{label}</p>
            <p className={`text-sm font-black text-${color}`}>{value}</p>
        </div>
    );
}
