"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ArrowLeft,
    Mail,
    Lock,
    User,
    Shield,
    Briefcase,
    FileCheck,
    CheckCircle2,
    Cpu,
    Zap,
    Activity,
    Phone,
    Target,
    Search
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const steps = [
    { id: 1, title: "Identity Profile", icon: User },
    { id: 2, title: "Professional Mandate", icon: Briefcase },
    { id: 3, title: "Fiduciary Audit", icon: Shield },
    { id: 4, title: "Genesis Complete", icon: CheckCircle2 },
];

export default function AdvisorRegisterPage() {
    const [currentStep, setCurrentStep] = useState(1);

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white flex flex-col items-center justify-center p-8 overflow-hidden relative">
            <SectionHighlight className="top-[-10%] left-[-5%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] right-[-5%]" color="cyan" />

            {/* Scale Progress Indicator */}
            <div className="w-full max-w-2xl mb-24 relative z-10">
                <div className="flex justify-between relative">
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;
                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                                <motion.div
                                    animate={{
                                        scale: isCurrent ? 1.2 : 1,
                                        boxShadow: isCurrent ? "0 0 20px rgba(124, 77, 255, 0.4)" : "none"
                                    }}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border ${isActive
                                            ? "bg-premium-gradient text-white border-transparent"
                                            : "bg-black/40 text-text-muted border-white/10"
                                        }`}
                                >
                                    <Icon size={24} />
                                </motion.div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? "text-accent-secondary" : "text-text-muted"}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                    {/* Connecting Line */}
                    <div className="absolute top-7 left-0 w-full h-px bg-white/5 -z-10 px-8" />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.98 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="w-full max-w-2xl relative z-10"
                >
                    <GlassCard className="p-12 border-white/10 shadow-2xl" neon>
                        {currentStep === 1 && (
                            <div className="space-y-10">
                                <div className="text-center space-y-4">
                                    <NeonBadge text="ONBOARDING PHASE: IDENTITY v.2" className="mx-auto" icon={FingerprintIcon} />
                                    <h2 className="text-5xl font-black tracking-tighter uppercase italic">Genesis</h2>
                                    <p className="text-text-secondary font-medium italic">Initialize your fiduciary signature on the network.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Legal Surname & Initials</label>
                                        <div className="relative group">
                                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={20} />
                                            <input type="text" placeholder="ALEXANDER VANCE" className="w-full bg-black/40 border border-white/5 rounded-[24px] py-5 pl-16 pr-6 text-white text-sm font-black tracking-widest focus:border-accent-secondary transition-all outline-none uppercase" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Mandate Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={20} />
                                            <input type="email" placeholder="VANCE@CAPITAL.COM" className="w-full bg-black/40 border border-white/5 rounded-[24px] py-5 pl-16 pr-6 text-white text-sm font-black tracking-widest focus:border-accent-secondary transition-all outline-none uppercase" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Cellular Uplink</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={20} />
                                            <input type="text" placeholder="+91 90000 00000" className="w-full bg-black/40 border border-white/5 rounded-[24px] py-5 pl-16 pr-6 text-white text-sm font-black tracking-widest focus:border-accent-secondary transition-all outline-none uppercase" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-10">
                                <div className="text-center space-y-4">
                                    <NeonBadge text="PHASE: PROFESSIONAL CREDENTIALS" className="mx-auto" icon={Cpu} />
                                    <h2 className="text-5xl font-black tracking-tighter uppercase italic">Protocol</h2>
                                    <p className="text-text-secondary font-medium italic">We verify every advisor to ensure absolute institutional integrity.</p>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">SEBI Registration Cipher</label>
                                        <div className="relative group">
                                            <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={20} />
                                            <input type="text" placeholder="INA0000XXXXX" className="w-full bg-black/40 border border-white/5 rounded-[24px] py-5 pl-16 pr-6 text-white text-lg font-black tracking-widest focus:border-accent-secondary transition-all outline-none uppercase" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Professional Vintage (Years)</label>
                                            <input type="number" placeholder="5" className="w-full bg-black/40 border border-white/5 rounded-[24px] py-5 px-6 text-white text-sm font-black tracking-widest focus:border-accent-secondary transition-all outline-none" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Mandate Scale (Cr)</label>
                                            <select className="w-full bg-black/40 border border-white/5 rounded-[24px] py-5 px-6 text-white text-sm font-black tracking-widest focus:border-accent-secondary transition-all outline-none appearance-none cursor-pointer uppercase">
                                                <option>RETAIL: &lt; 10 CR</option>
                                                <option>PARTNER: 10 - 50 CR</option>
                                                <option>ELITE: 50 - 100 CR</option>
                                                <option>FOUNDATION: 100+ CR</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-12 text-center">
                                <div className="space-y-6">
                                    <div className="w-24 h-24 rounded-full bg-accent-secondary/5 border border-accent-secondary/20 mx-auto flex items-center justify-center text-accent-secondary shadow-neon-glow relative overflow-hidden">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 opacity-20"
                                        >
                                            <Search size={96} className="text-accent-secondary" />
                                        </motion.div>
                                        <Cpu size={48} className="relative z-10" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-5xl font-black tracking-tighter uppercase italic">Hegemony Audit</h2>
                                        <p className="text-text-secondary font-medium leading-relaxed max-w-md mx-auto italic">
                                            Our semantic engine is currently indexing SEBI records, regulatory history, and verified alpha streams.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 rounded-[32px] bg-black/40 border border-white/5 flex items-center justify-between group overflow-hidden relative">
                                        <motion.div
                                            className="absolute bottom-0 left-0 h-1 bg-accent-secondary shadow-neon-glow"
                                            initial={{ width: 0 }}
                                            animate={{ width: "65%" }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        />
                                        <div className="flex flex-col text-left">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Cross-Database Handshake</span>
                                            <span className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 italic">NSDL | SEBI | NSE Feed</span>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-accent-primary/10 text-accent-primary px-3 py-1.5 rounded-full animate-pulse">Running Scan</span>
                                    </div>
                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.4em]">Fiduciary Integrity Check: Inactive</p>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="text-center space-y-12 py-8">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-28 h-28 rounded-[40px] bg-success/10 border border-success/30 mx-auto flex items-center justify-center text-success shadow-neon-glow-success"
                                >
                                    <CheckCircle2 size={64} />
                                </motion.div>
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-black tracking-tighter uppercase italic">Identity Received</h2>
                                    <p className="text-text-secondary font-medium leading-relaxed max-w-sm mx-auto italic">
                                        Our compliance tribunal will finalize your audit within a 48-hour cycle. Access to the Hub will be granted post-clearance.
                                    </p>
                                </div>
                                <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-4">
                                    <NeonBadge text="NEXT PHASE: ECOSYSTEM GENESIS" className="mx-auto" icon={Target} />
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">Verification Status: Level 1 Cleared</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-16 flex gap-6">
                            {currentStep > 1 && currentStep < 4 && (
                                <PremiumButton
                                    variant="secondary"
                                    onClick={prevStep}
                                    className="scale-90 flex-1 uppercase tracking-widest text-[10px]"
                                >
                                    <ArrowLeft size={18} className="mr-2" /> Global Return
                                </PremiumButton>
                            )}
                            {currentStep < 4 && (
                                <PremiumButton
                                    variant="primary"
                                    onClick={nextStep}
                                    className="flex-1 uppercase tracking-widest text-[11px] shadow-neon-glow py-5"
                                >
                                    {currentStep === 3 ? "Initialize Final Audit" : "Construct Profile"} <ArrowRight size={20} className="ml-3 inline-block" />
                                </PremiumButton>
                            )}
                            {currentStep === 4 && (
                                <PremiumButton
                                    variant="primary"
                                    onClick={() => window.location.href = "/"}
                                    className="w-full uppercase tracking-widest text-[11px] shadow-neon-glow py-5"
                                >
                                    Exit Genesis System
                                </PremiumButton>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </AnimatePresence>

            <div className="mt-20 text-center opacity-20 relative z-10">
                <div className="flex justify-center items-center gap-12 text-[9px] font-black uppercase tracking-[0.5em]">
                    <span className="flex items-center gap-2"><Lock size={12} /> ENCRYPTED HANDSHAKE</span>
                    <span className="flex items-center gap-2"><Activity size={12} /> NEURAL SYNC ACTIVE</span>
                </div>
            </div>
        </div>
    );
}

function FingerprintIcon({ size, className }: { size?: number, className?: string }) {
    return <Fingerprint size={size || 14} className={className} />;
}

function Fingerprint({ size, className }: { size: number, className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.02-.1 3.02" />
            <path d="M7 10.12a5 5 0 0 1 10 0c0 .19-.01.38-.03.57" />
            <path d="M2 12c0-5.52 4.48-10 10-10s10 4.48 10 10c0 1.02-.1 2.02-.1 3.02" />
            <path d="M12 22s-2.5-1.5-3-2.5" />
            <path d="M15 21s-1.5 1-3 1-3-1-3-1" />
            <path d="M12 18s2.5-1.5 3-2.5" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
