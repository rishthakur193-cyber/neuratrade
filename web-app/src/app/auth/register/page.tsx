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
    CheckCircle2,
    TrendingUp,
    Fingerprint,
    Database,
    CreditCard,
    ShieldCheck,
    Zap
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const steps = [
    { id: 1, title: "Nexus Identity", icon: User },
    { id: 2, title: "Federal KYC", icon: Fingerprint },
    { id: 3, title: "Strategy Alignment", icon: TrendingUp },
    { id: 4, title: "System Ready", icon: CheckCircle2 },
];

export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        aadhaar: "",
        pan: "",
        incomeRange: "₹10L - ₹25L",
        investmentExperience: "Intermediate (1-5 Years)",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); // Clear error on input change
    };

    // Per-step validation
    const validateStep = (): boolean => {
        setError("");
        if (currentStep === 1) {
            if (!formData.fullName.trim()) { setError("Full name is required"); return false; }
            if (!formData.email.trim() || !formData.email.includes("@")) { setError("Valid email is required"); return false; }
            if (!formData.password || formData.password.length < 6) { setError("Password must be at least 6 characters"); return false; }
        }
        if (currentStep === 2) {
            if (formData.pan && formData.pan.length !== 10) { setError("PAN must be exactly 10 characters (e.g. ABCDE1234F)"); return false; }
            if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar.replace(/\s/g, ""))) { setError("Aadhaar must be exactly 12 digits"); return false; }
        }
        return true;
    };

    const nextStep = () => {
        if (!validateStep()) return;
        setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    };
    const prevStep = () => { setError(""); setCurrentStep((prev) => Math.max(prev - 1, 1)); };

    const handleRegister = async () => {
        if (!validateStep()) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.fullName.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    role: "INVESTOR"
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Registration failed (${res.status})`);
            }

            // Auto-login after registration
            const loginRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email.trim().toLowerCase(), password: formData.password }),
            });
            const loginData = await loginRes.json();

            if (loginRes.ok && loginData.token) {
                const userData = {
                    token: loginData.token,
                    user: loginData.user || { email: formData.email, role: 'INVESTOR' }
                };
                localStorage.setItem("ecosystem_user", JSON.stringify(userData));
                localStorage.setItem("token", loginData.token); // Keep for compatibility
                localStorage.setItem("userRole", userData.user.role);
            }

            nextStep(); // Go to step 4 (Success)
            // Auto-redirect to dashboard after 3 seconds
            setTimeout(() => { window.location.href = '/dashboard'; }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <SectionHighlight className="top-[-10%] right-[-10%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] left-[-10%]" color="cyan" />

            {/* Header Brand */}
            <div className="absolute top-12 left-12 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-premium-gradient flex items-center justify-center shadow-neon-glow">
                    <TrendingUp size={18} />
                </div>
                <span className="font-black tracking-tighter text-xl uppercase">ECOSYSTEM</span>
            </div>

            {/* Progress Stepper */}
            <div className="w-full max-w-2xl mb-16 flex justify-between relative px-4">
                <div className="absolute top-5 left-10 right-10 h-[1px] bg-white/10 z-0" />
                <motion.div
                    className="absolute top-5 left-10 h-[2px] bg-accent-secondary z-0 transition-all duration-700 shadow-neon-glow"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    style={{ maxWidth: 'calc(100% - 80px)' }}
                />

                {steps.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep >= step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-4">
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.2 : 1,
                                    boxShadow: isActive ? "0 0 20px rgba(179, 136, 255, 0.4)" : "none"
                                }}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${isActive
                                    ? "bg-premium-gradient text-white border-accent-secondary"
                                    : "bg-black/40 text-text-muted border-white/10 backdrop-blur-xl"
                                    }`}
                            >
                                {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={20} />}
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? "text-accent-secondary" : "text-text-muted"}`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-xl relative"
                >
                    <GlassCard className="p-12 border-white/10" neon>
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <NeonBadge text="INITIALIZING ONBOARDING" className="mx-auto mb-4" icon={Zap} />
                                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">Create Identity</h2>
                                    <p className="text-text-secondary font-medium">Deploy your profile to the Ecosystem Ledger.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Full Legal Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Rahul Deshmukh"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-secondary/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Secure Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="rahul@ecosystem.io"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-secondary/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Access Passkey</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={18} />
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="••••••••••••"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-secondary/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <NeonBadge text="COMPLIANCE PROTOCOL" className="mx-auto mb-4" icon={ShieldCheck} />
                                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">Identify Entity</h2>
                                    <p className="text-text-secondary font-medium">Verify your citizenship via SEBI-approved nodes.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">PAN Identifier</label>
                                        <div className="relative group">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="pan"
                                                value={formData.pan}
                                                onChange={handleInputChange}
                                                placeholder="ABCDE1234F"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-cyan/50 outline-none transition-all font-medium uppercase tracking-widest"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Aadhaar Biometric Link</label>
                                        <div className="relative group">
                                            <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="aadhaar"
                                                value={formData.aadhaar}
                                                onChange={handleInputChange}
                                                placeholder="1234 5678 9012"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-cyan/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div className="text-center">
                                    <NeonBadge text="MATCHING CORE" className="mx-auto mb-4" icon={Database} />
                                    <h2 className="text-4xl font-black tracking-tight text-white mb-2">Wealth Profile</h2>
                                    <p className="text-text-secondary font-medium">Aligning your mandate with specialized institutional advisors.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Annual Sustenance (Income)</label>
                                        <select
                                            name="incomeRange"
                                            value={formData.incomeRange}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:border-accent-secondary/50 outline-none transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            <option className="bg-[#0B0B12]">Below ₹10L</option>
                                            <option className="bg-[#0B0B12]">₹10L - ₹25L</option>
                                            <option className="bg-[#0B0B12]">₹25L - ₹1Cr</option>
                                            <option className="bg-[#0B0B12]">Ultra HNI (₹1Cr+)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">Asset Management Experience</label>
                                        <select
                                            name="investmentExperience"
                                            value={formData.investmentExperience}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:border-accent-secondary/50 outline-none transition-all font-medium appearance-none cursor-pointer"
                                        >
                                            <option className="bg-[#0B0B12]">Novice (0-1 Years)</option>
                                            <option className="bg-[#0B0B12]">Intermediate (1-5 Years)</option>
                                            <option className="bg-[#0B0B12]">Advanced (5-10 Years)</option>
                                            <option className="bg-[#0B0B12]">Institutional Grade (10+ Years)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="text-center space-y-8">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-24 h-24 rounded-full bg-success/10 border border-success/30 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(0,230,118,0.2)]"
                                >
                                    <CheckCircle2 size={64} className="text-success" />
                                </motion.div>
                                <div>
                                    <h2 className="text-4xl font-black tracking-tight text-white mb-2 uppercase tracking-tighter">System Ready</h2>
                                    <p className="text-text-secondary font-medium leading-relaxed">
                                        Verification sequence complete. Your profile is now mapped to the Ecosystem matching algorithm.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-text-muted text-[10px] font-black tracking-widest uppercase leading-loose flex items-center gap-4">
                                    <Shield size={24} className="text-accent-cyan shrink-0" />
                                    <span className="text-left">You are now protected by our fiduciary charter and 100% data sovereign encryption protocols.</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-black uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        <div className="mt-12 flex gap-4">
                            {currentStep > 1 && currentStep < 4 && (
                                <button
                                    onClick={prevStep}
                                    className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Previous Node
                                </button>
                            )}
                            {currentStep < 4 && (
                                <PremiumButton
                                    variant="primary"
                                    onClick={currentStep === 3 ? handleRegister : nextStep}
                                    disabled={loading}
                                    className="flex-1 py-4 text-sm"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Database className="animate-spin" size={18} /> Deploying Data...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {currentStep === 3 ? "Complete Enrollment" : "Continue Sequence"} <ArrowRight size={18} />
                                        </div>
                                    )}
                                </PremiumButton>
                            )}
                            {currentStep === 4 && (
                                <PremiumButton
                                    variant="primary"
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="w-full py-5 text-base shadow-neon-glow"
                                >
                                    Initialize Core Dashboard
                                </PremiumButton>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </AnimatePresence>

            <div className="mt-12 text-center opacity-30">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em]">Institutional Grade Security Framework v8.1</p>
            </div>
        </div>
    );
}
