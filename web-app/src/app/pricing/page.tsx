"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check,
    ShieldCheck,
    CreditCard,
    Zap,
    Crown,
    ArrowRight,
    Lock,
    Smartphone,
    Info,
    Cpu,
    Target,
    Activity,
    ChevronLeft
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const plans = [
    {
        name: "Basic Node",
        price: "Free",
        desc: "Ideal for retail investors initializing their journey.",
        features: ["Standard Dashboard", "AI Advisor Matching", "Public Success Feed", "Community Network"],
        cta: "Initialize",
        popular: false,
        accent: "#94a3b8"
    },
    {
        name: "Pro Shield",
        price: "₹999",
        period: "/mo",
        desc: "For tactical investors seeking alpha and verified audits.",
        features: ["Portfolio Quant Suite", "Risk Management Hub", "Unlimited Advisor Uplinks", "Verified Performance Sync", "24/7 Priority Relay"],
        cta: "Go Pro",
        popular: true,
        accent: "#7C4DFF"
    },
    {
        name: "Elite Hegemony",
        price: "₹2,499",
        period: "/mo",
        desc: "The institutional edge for high-fidelity wealth control.",
        features: ["Custom Strategy Builder", "Priority AI Fraud Radar", "Fiduciary Vault Access", "Alternative Asset Protocol", "1-on-1 Strategic Review"],
        cta: "Join Elite",
        popular: false,
        accent: "#00E5FF"
    }
];

export default function PricingPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleSelect = (planName: string) => {
        setSelectedPlan(planName);
        setShowCheckout(true);
        setSuccessMsg("");
    };

    const handlePayment = async (method: string) => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('ecosystem_user');
            if (!storedUser) {
                window.location.href = '/auth/login';
                return;
            }
            const { token } = JSON.parse(storedUser);

            const cost = plans.find(p => p.name === selectedPlan)?.price || 'Free';

            const res = await fetch('/api/platform-subscriptions/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ plan: selectedPlan, amount: cost, method })
            });

            if (res.ok) {
                setSuccessMsg(`NODE DEPLOYED: Welcome to ${selectedPlan}. Redirecting to Mission Control...`);
                setTimeout(() => window.location.href = '/dashboard', 3000);
            } else {
                alert("Payment Authorization Failed.");
            }
        } catch (error) {
            alert("Network Connectivity Issue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-12 relative overflow-hidden flex items-center justify-center">
            <SectionHighlight className="top-[-10%] left-[-5%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] right-[-5%]" color="cyan" />

            <AnimatePresence mode="wait">
                {!showCheckout ? (
                    <motion.section
                        key="plans"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-7xl mx-auto py-16 relative z-10 w-full"
                    >
                        <header className="text-center mb-24 space-y-6">
                            <NeonBadge text="ECOSYSTEM SUBSCRIPTION PROTOCOL v4.1" className="mx-auto" icon={Lock} />
                            <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-tight">
                                Scale Your <span className="text-transparent bg-clip-text bg-premium-gradient">Capital</span>
                            </h1>
                            <p className="text-2xl text-text-secondary font-medium italic max-w-2xl mx-auto">
                                Institutional-grade tools structured to evolve with your portfolio.
                                Zero commissions. Absolute transparency.
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {plans.map((plan, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group h-full"
                                >
                                    <GlassCard
                                        className={`p-12 h-full flex flex-col border-white/5 relative overflow-hidden transition-all duration-500 hover:border-white/20 hover:scale-[1.02] ${plan.popular ? 'shadow-neon-glow !shadow-accent-secondary/10' : ''
                                            }`}
                                        neon={plan.popular}
                                    >
                                        {plan.popular && (
                                            <div className="absolute top-0 right-0 p-6">
                                                <NeonBadge text="MOST ADVANCED" color="purple" />
                                            </div>
                                        )}

                                        <div className="mb-12 space-y-4">
                                            <h3 className="text-3xl font-black tracking-tighter uppercase italic">{plan.name}</h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-5xl font-black tracking-tighter uppercase">{plan.price}</span>
                                                <span className="text-text-muted font-bold text-xs uppercase tracking-widest">{plan.period}</span>
                                            </div>
                                            <p className="text-[11px] text-text-secondary font-black uppercase tracking-widest leading-relaxed italic">{plan.desc}</p>
                                        </div>

                                        <ul className="space-y-6 mb-16 flex-1">
                                            {plan.features.map(f => (
                                                <li key={f} className="flex items-start gap-4 text-xs font-bold uppercase tracking-widest group/item">
                                                    <div className="w-5 h-5 rounded-full bg-accent-secondary/10 text-accent-secondary flex items-center justify-center shrink-0 mt-0.5 group-hover/item:shadow-neon-glow transition-all">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                    <span className="text-white/80 leading-relaxed">{f}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <PremiumButton
                                            variant={plan.popular ? "primary" : "secondary"}
                                            onClick={() => handleSelect(plan.name)}
                                            className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] shadow-lg"
                                        >
                                            {plan.cta} <ArrowRight size={18} className="ml-2 inline-block transition-transform group-hover:translate-x-1" />
                                        </PremiumButton>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-24 flex justify-center">
                            <div className="flex flex-wrap items-center justify-center gap-12 py-8 px-16 rounded-[40px] bg-white/[0.03] border border-white/5 backdrop-blur-3xl opacity-40 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="text-success shadow-neon-glow-success" size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">PCI DSS V4.0</span>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex items-center gap-3">
                                    <Lock className="text-accent-secondary shadow-neon-glow" size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">256-BIT CRYPTO</span>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex items-center gap-4">
                                    <Smartphone size={24} className="text-text-muted" />
                                    <CreditCard size={24} className="text-text-muted" />
                                </div>
                            </div>
                        </div>
                    </motion.section>
                ) : (
                    <motion.section
                        key="checkout"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-6xl mx-auto py-20 relative z-10 w-full"
                    >
                        <button
                            onClick={() => setShowCheckout(false)}
                            className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-white mb-16 flex items-center gap-3 transition-colors group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Global Protocol: Pricing
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            {/* Mandate Summary */}
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <NeonBadge text="GENESIS UPGRADE: FINAL PHASE" icon={Zap} />
                                    <h2 className="text-6xl font-black tracking-tighter uppercase italic">Checkout</h2>
                                    <p className="text-lg text-text-secondary font-medium italic">Establishing your institutional uplink to the {selectedPlan} node.</p>
                                </div>

                                <GlassCard className="p-12 border-white/10 shadow-2xl space-y-10" neon>
                                    <div className="flex justify-between items-end border-b border-white/5 pb-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">Operational Tier</p>
                                            <p className="text-4xl font-black tracking-tighter italic uppercase underline decoration-accent-secondary underline-offset-8">{selectedPlan}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">Cycle</p>
                                            <p className="text-2xl font-black text-white italic">RECURRING</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center text-text-muted text-[10px] font-black uppercase tracking-widest">
                                            <span>Subtotal Node Fee</span>
                                            <span className="text-white text-lg">{plans.find(p => p.name === selectedPlan)?.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-text-muted text-[10px] font-black uppercase tracking-widest">
                                            <span>Infrastructure Tax</span>
                                            <span className="text-white text-lg">₹0.00</span>
                                        </div>
                                        <div className="border-t-2 border-dashed border-white/10 pt-10 flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-xl font-black uppercase tracking-[0.2em] italic">Total Mandate</p>
                                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] italic">Excl. GST (Verified)</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-6xl font-black text-transparent bg-clip-text bg-premium-gradient tracking-tighter italic shadow-neon-glow">
                                                    {plans.find(p => p.name === selectedPlan)?.price}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>

                                <div className="p-8 rounded-[32px] bg-success/5 border border-success/20 flex gap-6 items-center group">
                                    <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center text-success shadow-neon-glow-success relative overflow-hidden">
                                        <Zap size={32} className="relative z-10" />
                                        <motion.div animate={{ opacity: [0, 0.2, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-success" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Instant Deployment</p>
                                        <p className="text-[9px] text-text-muted font-medium uppercase tracking-widest leading-loose mt-1">Full-stack activation within 300ms of federal confirmation.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Secure Payment Terminal */}
                            <div className="space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted pl-4">Payment Terminal 0x1A</h3>
                                <GlassCard className="p-10 border-accent-secondary/30 relative overflow-hidden shadow-2xl" neon>
                                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                        <Crown size={200} className="text-accent-secondary" />
                                    </div>

                                    <div className="space-y-6 mb-12 relative z-10">
                                        <div className="p-6 rounded-3xl border-2 border-accent-secondary bg-accent-secondary/5 flex items-center justify-between cursor-pointer shadow-neon-glow !shadow-accent-secondary/5 group" onClick={() => handlePayment('UPI')}>
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-lg transition-transform group-hover:scale-105">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="w-full" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight text-white italic">UPI Protocol</p>
                                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-widest italic">BHIM | PhonePe | GPay</p>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border-4 border-accent-secondary bg-accent-secondary animate-pulse shadow-neon-glow" />
                                        </div>

                                        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-between cursor-pointer opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" onClick={() => handlePayment('CARD')}>
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-text-muted italic text-xs font-black">
                                                    CC/DC
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight text-white/50 italic">Digital Cards</p>
                                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-widest italic">VISA | MC | AMEX</p>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border border-white/10" />
                                        </div>

                                        <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex items-center justify-between cursor-pointer opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-text-muted">
                                                    <ShieldCheck size={28} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight text-white/50 italic">Mandate Banking</p>
                                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-widest italic">Netbanking Nodes</p>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border border-white/10" />
                                        </div>
                                    </div>

                                    <PremiumButton variant="primary" onClick={() => handlePayment('SYSTEM_DEFAULT')} disabled={loading} className="w-full py-6 text-sm font-black uppercase tracking-[0.3em] shadow-neon-glow group relative z-10 overflow-hidden">
                                        {loading ? "PROCESSING..." : "Deploy & Activate Node"}
                                        <motion.div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </PremiumButton>

                                    {successMsg && (
                                        <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/30 text-success text-[10px] font-black tracking-widest uppercase text-center animate-pulse">
                                            {successMsg}
                                        </div>
                                    )}

                                    <div className="mt-8 text-center text-[9px] text-text-muted font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 relative z-10">
                                        <Lock size={12} className="text-success shadow-neon-glow-success" /> 100% SECURE CRYPTOGRAPHIC TRANSACTION
                                    </div>
                                </GlassCard>

                                <div className="grid grid-cols-2 gap-6 relative z-10">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <Activity size={16} className="text-accent-cyan" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Real-time Activation</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                        <ShieldCheck size={16} className="text-success" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Fiduciary Guarantee</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            <footer className="fixed bottom-0 left-0 w-full py-8 text-center opacity-20 pointer-events-none">
                <p className="text-[9px] font-black uppercase tracking-[0.5em]">256-BIT SECURE BILLING ENGINE v9.0 // ECOSYSTEM OF SMART INVESTING</p>
            </footer>
        </div>
    );
}
