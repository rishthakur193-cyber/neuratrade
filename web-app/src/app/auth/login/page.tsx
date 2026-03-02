"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, Zap, Activity, Cpu } from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [requires2FA, setRequires2FA] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, totpCode }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.requires2FA) {
                    setRequires2FA(true);
                    setLoading(false);
                    return;
                }

                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.user.role);

                // Redirect based on role
                const role = data.user.role;
                if (role === 'ADMIN') window.location.href = '/admin/dashboard';
                else if (role === 'ADVISOR') window.location.href = '/advisor/dashboard';
                else if (role === 'TRAINEE') window.location.href = '/trainee/dashboard';
                else window.location.href = '/dashboard';
            } else {
                setError(data.error || "Authentication failed");
            }
        } catch (err) {
            setError("Server connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white flex items-center justify-center p-6 relative overflow-hidden">
            <SectionHighlight className="top-[-20%] left-[-10%]" color="purple" />
            <SectionHighlight className="bottom-[-20%] right-[-10%]" color="cyan" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-premium-gradient flex items-center justify-center shadow-neon-glow mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">Secure <span className="text-transparent bg-clip-text bg-premium-gradient">Access</span></h1>
                    <p className="text-text-secondary font-medium uppercase tracking-[0.2em] text-[10px]">Institutional Gateway v4.2</p>
                </div>

                <GlassCard className="p-10 border-white/10" neon>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Identity Hash (Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="rahul@ecosystem.io"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-secondary/50 outline-none transition-all font-medium placeholder:text-text-muted/30"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest pl-1">Passkey</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-secondary/50 outline-none transition-all font-medium placeholder:text-text-muted/30"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {requires2FA && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-[10px] font-black text-accent-cyan uppercase tracking-widest pl-1">Neural 2FA Code</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-cyan group-focus-within:text-white transition-colors" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={totpCode}
                                            onChange={(e) => setTotpCode(e.target.value)}
                                            placeholder="XXXXXX"
                                            maxLength={6}
                                            className="w-full bg-accent-cyan/5 border border-accent-cyan/20 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-cyan/50 outline-none transition-all font-black tracking-[0.5em] text-center"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-danger/10 border border-danger/20 p-3 rounded-xl text-danger text-[10px] font-black text-center uppercase tracking-widest"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted pt-2 px-1">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" className="hidden" />
                                <div className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-sm bg-accent-secondary opacity-0 check-indicator transition-opacity" />
                                </div>
                                Persevere Session
                            </label>
                            <a href="#" className="hover:text-accent-secondary transition-colors">Bypass Recovery</a>
                        </div>

                        <PremiumButton
                            variant="primary"
                            className="w-full py-4 text-sm shadow-neon-glow"
                            disabled={loading}
                        >
                            {loading ? (
                                <Activity className="animate-spin" size={20} />
                            ) : (
                                <>Verify Identity <ArrowRight size={18} /></>
                            )}
                        </PremiumButton>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">New to the Ecosystem?</p>
                        <PremiumButton
                            variant="secondary"
                            className="w-full !py-3 text-[10px]"
                            onClick={() => window.location.href = '/auth/register'}
                        >
                            Initialize Registration
                        </PremiumButton>
                    </div>
                </GlassCard>

                <div className="mt-10 flex flex-col items-center gap-4 opacity-40">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <ShieldCheck size={14} className="text-success" />
                        <span className="text-[9px] font-black tracking-widest uppercase">Encryption active: 256-BIT AES-GCM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Cpu size={12} className="text-text-muted" />
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Powered by Ecosystem AI Compliance Engine</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
