"use client";

import React, { useState } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash2,
    PieChart,
    Zap,
    Shield,
    ShieldCheck,
    TrendingUp,
    Info,
    ChevronRight,
    Settings,
    Save,
    Play,
    Activity,
    Target,
    BarChart3,
    Lock,
    Cpu
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const assetCategories = [
    { id: "equity", name: "Equity (Large Cap)", color: "#7C4DFF", risk: "Medium", icon: TrendingUp },
    { id: "midcap", name: "Mid/Small Cap", color: "#B388FF", risk: "High", icon: Activity },
    { id: "debt", name: "Fixed Income/Debt", color: "#00E5FF", risk: "Low", icon: Shield },
    { id: "gold", name: "Gold/Commodities", color: "#FFAB40", risk: "Medium", icon: Target },
    { id: "crypto", name: "Digital Assets", color: "#E040FB", risk: "Very High", icon: Zap },
];

export default function StrategyBuilder() {
    const [items, setItems] = useState([
        { id: "1", type: "equity", weight: 40 },
        { id: "2", type: "debt", weight: 30 },
        { id: "3", type: "midcap", weight: 20 },
        { id: "4", type: "gold", weight: 10 },
    ]);

    const totalWeight = items.reduce((acc, curr) => acc + curr.weight, 0);

    const updateWeight = (id: string, delta: number) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, weight: Math.max(0, Math.min(100, item.weight + delta)) } : item
        ));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const addItem = (typeId: string) => {
        if (totalWeight >= 100) return;
        setItems(prev => [...prev, { id: Math.random().toString(), type: typeId, weight: 0 }]);
    };

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white flex overflow-hidden">
            {/* Left Sidebar - Asset Manifest */}
            <aside className="w-[400px] border-r border-white/5 bg-black/40 backdrop-blur-3xl p-10 flex flex-col relative z-20">
                <div className="mb-12">
                    <NeonBadge text="PROPRIETARY TOOLSET v2.1" className="mb-6" icon={Cpu} />
                    <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">Nexus Builder</h2>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">
                        Construct institutional-grade investment mandates using our atomic asset blocks.
                    </p>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-6">Available Asset Blocks</h3>
                    {assetCategories.map(cat => (
                        <motion.div
                            key={cat.id}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addItem(cat.id)}
                            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-secondary/50 transition-all cursor-pointer group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 transition-colors group-hover:bg-accent-secondary/10" style={{ color: cat.color }}>
                                    <cat.icon size={22} />
                                </div>
                                <div>
                                    <span className="font-black text-sm block tracking-tight">{cat.name}</span>
                                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{cat.risk} Risk Profile</span>
                                </div>
                            </div>
                            <Plus size={18} className="text-text-muted group-hover:text-accent-secondary transition-colors" />
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 p-8 rounded-[32px] bg-accent-secondary/5 border border-accent-secondary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={48} className="text-accent-secondary" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent-secondary mb-4 flex items-center gap-2">
                        <Cpu size={14} /> AI OPTIMIZER
                    </h4>
                    <p className="text-[11px] text-text-secondary font-medium leading-relaxed mb-6">
                        Execute Monte Carlo protocols to stress-test your allocation against 10k+ synthetic market cycles.
                    </p>
                    <PremiumButton variant="secondary" className="w-full !py-2.5 text-[9px] shadow-neon-glow !shadow-accent-secondary/10">
                        Initialize Simulation
                    </PremiumButton>
                </div>
            </aside>

            {/* Main Canvas - Layout Engine */}
            <main className="flex-1 flex flex-col relative bg-radial-highlights">
                <SectionHighlight className="top-1/4 right-1/4" color="purple" />

                {/* Canvas Header */}
                <header className="px-12 py-8 bg-[#0B0B12]/40 backdrop-blur-xl border-b border-white/5 flex justify-between items-center z-10">
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col">
                            <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Total Allocation</p>
                            <h3 className={`text-4xl font-black tracking-tighter ${totalWeight > 100 ? 'text-danger shadow-[0_0_20px_rgba(255,82,82,0.3)]' : totalWeight === 100 ? 'text-success shadow-[0_0_20px_rgba(0,230,118,0.3)]' : 'text-white'}`}>
                                {totalWeight}%
                                <span className="text-xs font-black text-text-muted ml-3 uppercase tracking-widest">/ 100% Target</span>
                            </h3>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="flex flex-col">
                            <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Projected CAGR</p>
                            <h3 className="text-4xl font-black tracking-tighter text-accent-cyan">18.4% <span className="text-[10px] text-text-muted font-bold ml-2 uppercase tracking-widest italic">(EST)</span></h3>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <PremiumButton variant="secondary" className="scale-90 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            <Settings size={16} /> Global Config
                        </PremiumButton>
                        <PremiumButton variant="primary" className="scale-90 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            <Save size={16} /> Deploy Strategy
                        </PremiumButton>
                    </div>
                </header>

                {/* Construction Zone */}
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="text-center">
                            <h2 className="text-2xl font-black tracking-tight uppercase tracking-[0.3em] opacity-40">Canvas Manifest</h2>
                        </div>

                        <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {items.map(item => {
                                    const cat = assetCategories.find(c => c.id === item.type)!;
                                    return (
                                        <Reorder.Item
                                            key={item.id}
                                            value={item}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="p-8 rounded-[32px] bg-white/5 backdrop-blur-3xl border border-white/5 flex items-center justify-between group hover:border-accent-secondary/30 transition-all duration-500 shadow-xl"
                                        >
                                            <div className="flex items-center gap-8 flex-1">
                                                <div className="cursor-grab text-text-muted/40 hover:text-accent-secondary transition-colors">
                                                    <div className="w-1.5 h-1.5 bg-current rounded-full mb-1.5" />
                                                    <div className="w-1.5 h-1.5 bg-current rounded-full mb-1.5" />
                                                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                                </div>
                                                <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105" style={{ color: cat.color }}>
                                                    <cat.icon size={32} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-end mb-4">
                                                        <h4 className="font-black text-lg tracking-tight uppercase tracking-widest">{cat.name}</h4>
                                                        <div className="text-right">
                                                            <span className="text-3xl font-black tracking-tighter" style={{ color: cat.color }}>{item.weight}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <input
                                                            type="range"
                                                            value={item.weight}
                                                            onChange={(e) => updateWeight(item.id, parseInt(e.target.value) - item.weight)}
                                                            className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-secondary transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="ml-8 w-12 h-12 rounded-xl bg-danger/5 text-danger/40 hover:bg-danger hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </Reorder.Item>
                                    );
                                })}
                            </AnimatePresence>
                        </Reorder.Group>

                        {items.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-[400px] flex flex-col items-center justify-center text-center p-12 rounded-[40px] border-2 border-dashed border-white/5"
                            >
                                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                                    <Plus size={48} className="text-text-muted/40" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-widest opacity-60">Null Vector</h3>
                                <p className="text-text-muted font-medium max-w-sm">
                                    Inject asset nodes from the sidebar to initialize strategy construction.
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>

            {/* Right Sidebar - Logic Engine */}
            <aside className="w-[400px] border-l border-white/5 bg-black/40 backdrop-blur-3xl p-10 hidden 2xl:flex flex-col gap-10 relative z-20 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Analytics Feed</h3>
                    <GlassCard className="p-8 border-white/5">
                        <h4 className="text-xs font-black mb-8 flex items-center gap-3">
                            <Activity size={18} className="text-accent-cyan" />
                            RISK PROFILES
                        </h4>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] text-text-muted font-black uppercase tracking-widest">Volatility (Sigma)</span>
                                    <span className="text-lg font-black text-white">12.4%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} className="h-full bg-accent-cyan shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[9px] text-text-muted font-black uppercase tracking-widest">Max Drawdown</span>
                                    <span className="text-lg font-black text-danger">-18.2%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: "60%" }} className="h-full bg-danger shadow-[0_0_10px_rgba(255,82,82,0.5)]" />
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Compliance Hub</h3>
                    <div className="space-y-4">
                        {[
                            { text: "Institutional concentration < 25%", ok: true },
                            { text: "Small-Cap exposure exceeded (Warning)", ok: false },
                            { text: "Fiduciary tag alignment check", ok: true }
                        ].map((item, i) => (
                            <div key={i} className={`p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-4 ${!item.ok ? 'border-danger/30 bg-danger/5' : ''}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.ok ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                    {item.ok ? <ShieldCheck size={12} /> : <Info size={12} />}
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-tight ${item.ok ? 'text-text-muted' : 'text-danger'}`}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-10 rounded-[40px] bg-premium-gradient relative overflow-hidden group shadow-neon-glow">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <div className="relative z-10 text-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">Alpha Projection (10Y)</p>
                        <h3 className="text-6xl font-black tracking-tighter mb-4 italic">2.4x</h3>
                        <p className="text-[10px] font-medium text-white/80 leading-relaxed mb-6">
                            Projected capital generation based on historical synthetic backtesting.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 p-2 rounded-xl border border-white/10 uppercase font-black text-[9px] text-success">Bull: +35%</div>
                            <div className="bg-black/20 p-2 rounded-xl border border-white/10 uppercase font-black text-[9px] text-danger">Bear: -12%</div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
