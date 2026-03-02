"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    UploadCloud,
    FileText,
    CheckCircle2,
    AlertCircle,
    ScanFace,
    Lock,
    ArrowRight,
    Info,
    Clock,
    Database,
    Cpu,
    Fingerprint,
    CreditCard
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const requirements = [
    { id: "pan", title: "PAN Card", desc: "Tax Identity Protocol", status: "verified", icon: CreditCard },
    { id: "aadhaar", title: "Aadhaar UID", desc: "Biometric Address Node", status: "pending", icon: Fingerprint },
    { id: "bank", title: "Bank Mandate", desc: "F&O Authorization Flow", status: "rejected", icon: Database },
];

export default function KYCDashboard() {
    const [activeTab, setActiveTab] = useState("aadhaar");
    const [kycStatus, setKycStatus] = useState("UNVERIFIED");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        async function fetchStatus() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setKycStatus(data.kycStatus || "UNVERIFIED");
                }
            } catch (err) {
                console.error("KYC fetch error", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStatus();
    }, []);

    const handleKYCSubmit = async () => {
        setSubmitting(true);
        setMessage("");
        try {
            const token = localStorage.getItem('token');
            const file = fileInputRef.current?.files?.[0];

            const formData = new FormData();
            formData.append('documentType', activeTab);
            if (file) {
                formData.append('file', file);
            } else {
                formData.append('mockAadhaar', 'true');
            }

            const res = await fetch('/api/kyc/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setKycStatus('PENDING');
                setMessage(data.message || "KYC submitted successfully");
            } else {
                setMessage(data.error || "Failed to submit KYC");
            }
        } catch (err) {
            setMessage("Network error. Could not upload securely.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMessage(`Node loaded: ${file.name}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-12 flex flex-col items-center justify-center relative overflow-hidden">
            <SectionHighlight className="top-[-10%] left-[-10%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] right-[-10%]" color="cyan" />

            <div className="w-full max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Status Overview Pod */}
                <div className="lg:col-span-4 space-y-10">
                    <div>
                        <NeonBadge text="SECURITY COMPLIANCE HUB v4.0" className="mb-4" icon={Lock} />
                        <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Identity Hub</h1>
                        <p className="text-sm text-text-secondary font-medium italic">Regulatory AML/KYC Federal Bridge.</p>
                    </div>

                    <GlassCard className="p-8 border-white/5 relative overflow-hidden group" neon>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <ShieldCheck size={120} />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-8">Verification Vector</h3>
                        <div className="flex items-center gap-6 mb-10">
                            <div className="relative">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                    <motion.circle
                                        cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={276}
                                        initial={{ strokeDashoffset: 276 }}
                                        animate={{ strokeDashoffset: kycStatus === 'PENDING' ? 276 * (1 - 0.9) : 276 * (1 - 0.66) }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                        className={kycStatus === 'PENDING' ? "text-success" : "text-accent-secondary"}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black tracking-tighter italic">
                                    {kycStatus === 'PENDING' ? '90%' : '66%'}
                                </div>
                            </div>
                            <div>
                                <h4 className={`font-black text-xl tracking-tight ${kycStatus === 'PENDING' ? 'text-success' : 'text-warning'}`}>
                                    {kycStatus === 'PENDING' ? 'Processing' : 'Interrupted'}
                                </h4>
                                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1">
                                    {kycStatus === 'PENDING' ? 'Awaiting Final Audit' : '1 Node Refused Access'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {requirements.map(req => (
                                <div
                                    key={req.id}
                                    onClick={() => setActiveTab(req.id)}
                                    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all duration-300 ${activeTab === req.id
                                        ? 'bg-accent-secondary/5 border-accent-secondary shadow-[0_0_20px_rgba(179,136,255,0.1)]'
                                        : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl bg-black/40 border border-white/10 ${req.status === 'verified' ? 'text-success' :
                                            req.status === 'rejected' ? 'text-danger' : 'text-warning'
                                            }`}>
                                            <req.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight">{req.title}</p>
                                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{req.desc}</p>
                                        </div>
                                    </div>
                                    {req.status === 'verified' && <CheckCircle2 size={16} className="text-success" />}
                                    {req.status === 'pending' && <Clock size={16} className="text-warning animate-pulse" />}
                                    {req.status === 'rejected' && <AlertCircle size={16} className="text-danger" />}
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <div className="p-6 rounded-[32px] bg-success/5 border border-success/20 flex gap-4 text-success relative overflow-hidden group">
                        <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Lock size={20} className="shrink-0 mt-0.5 relative z-10" />
                        <p className="text-[10px] font-black leading-loose uppercase tracking-widest relative z-10">
                            Vault encrypted: AES-256 GCM. Fed-approved secure data storage node.
                        </p>
                    </div>
                </div>

                {/* Main Interaction Canvas */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="h-full"
                        >
                            <GlassCard className="p-12 border-white/10 h-full flex flex-col" neon>
                                {activeTab === 'pan' && (
                                    <div className="h-full flex flex-col justify-center items-center text-center space-y-10">
                                        <div className="w-28 h-28 rounded-3xl bg-success/10 border border-success/30 flex items-center justify-center text-success shadow-[0_0_40px_rgba(0,230,118,0.2)]">
                                            <CheckCircle2 size={56} />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-4xl font-black tracking-tight uppercase">PAN Link Active</h2>
                                            <p className="text-text-secondary font-medium">Federal tax identity node successfully integrated.</p>
                                        </div>
                                        <div className="p-6 rounded-3xl bg-black/40 border border-white/5 w-full max-w-md text-left flex justify-between items-center group">
                                            <div>
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Entity Identifier</p>
                                                <p className="text-xl font-black tracking-widest uppercase text-white group-hover:text-accent-cyan transition-colors">ABCDE1234F</p>
                                            </div>
                                            <ShieldCheck className="text-success shadow-neon-glow" size={24} />
                                        </div>
                                        <PremiumButton variant="secondary" className="scale-90 opacity-60 pointer-events-none uppercase tracking-widest text-[9px]">Node Verified by NSDL</PremiumButton>
                                    </div>
                                )}

                                {activeTab === 'aadhaar' && (
                                    <div className="flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-12">
                                            <div className="space-y-2">
                                                <h2 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-4">
                                                    <ScanFace className="text-accent-secondary" size={36} />
                                                    Aadhaar Sync
                                                </h2>
                                                <p className="text-text-secondary font-medium">Initialize Govt Identity Bridge via DigiLocker API.</p>
                                            </div>
                                            <div className="px-5 py-2 rounded-full bg-warning/10 text-warning border border-warning/20 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(255,171,64,0.15)] animate-pulse">
                                                Awaiting Handshake
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[48px] bg-white/[0.02] group hover:border-accent-secondary/50 transition-all duration-700 cursor-pointer p-12 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="w-24 h-24 rounded-3xl bg-black border border-white/10 flex items-center justify-center text-text-muted group-hover:text-accent-secondary group-hover:scale-110 group-hover:shadow-neon-glow transition-all mb-8 relative z-10">
                                                <Fingerprint size={48} />
                                            </div>
                                            <h3 className="text-2xl font-black mb-3 uppercase tracking-tight relative z-10">Connect DigiLocker Pod</h3>
                                            <p className="text-xs text-text-muted mb-10 text-center max-w-sm font-medium leading-relaxed relative z-10">
                                                Seamlessly import your Aadhaar identity using UIDAI-verified multi-factor authentication.
                                            </p>
                                            <PremiumButton
                                                variant="primary"
                                                className="w-full max-w-sm py-5 text-sm shadow-neon-glow relative z-10"
                                                onClick={handleKYCSubmit}
                                                disabled={submitting}
                                            >
                                                {submitting ? "INITIALIZING..." : "Initialize E-KYC Protocol"}
                                            </PremiumButton>
                                            {message && <p className="mt-4 text-[10px] text-accent-cyan font-black uppercase tracking-widest relative z-10">{message}</p>}
                                            <button className="mt-4 text-[10px] text-text-muted font-black uppercase tracking-[0.3em] hover:text-white transition-colors underline underline-offset-8 relative z-10">
                                                Manual Document Inject (48h Delta)
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'bank' && (
                                    <div className="flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="space-y-2">
                                                <h2 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-4">
                                                    <Database className="text-danger" size={36} />
                                                    Yield Ledger
                                                </h2>
                                                <p className="text-text-secondary font-medium">Mandatory income verification for derivative authorization.</p>
                                            </div>
                                            <div className="px-5 py-2 rounded-full bg-danger/10 text-danger border border-danger/20 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(255,82,82,0.15)]">
                                                Node Rejected
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[32px] bg-danger/5 border border-danger/20 flex gap-6 items-start mb-12 shadow-[0_0_20px_rgba(255,82,82,0.05)]">
                                            <div className="p-3 rounded-2xl bg-danger/10 text-danger">
                                                <AlertCircle size={28} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-black text-danger uppercase tracking-widest">Integrity Violation: Encrypted Entry</h4>
                                                <p className="text-xs text-text-secondary font-medium leading-loose">
                                                    The submitted mandate (PDF) is locked via secondary encryption. Please de-encrypt the bank statement covering the previous 180-day cycle and re-initialize the upload pod.
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            onClick={handleUploadClick}
                                            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[48px] bg-black/40 group hover:border-premium-gradient transition-all duration-700 cursor-pointer p-12"
                                        >
                                            <input type="file" className="hidden" ref={fileInputRef} accept=".pdf,.jpg,.png" onChange={handleFileChange} />
                                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted group-hover:text-accent-secondary group-hover:scale-110 shadow-lg transition-all mb-6">
                                                <UploadCloud size={32} />
                                            </div>
                                            <h3 className="text-lg font-black mb-2 uppercase tracking-tight">Overwrite Current Node</h3>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Max Threshold: 10MB • Format: PDF (Unlocked)</p>
                                        </div>

                                        <button
                                            onClick={handleKYCSubmit}
                                            disabled={submitting}
                                            className={`w-full mt-10 py-5 rounded-[24px] border border-white/5 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-colors ${submitting ? 'bg-white/5 text-text-muted opacity-50 cursor-not-allowed' : 'bg-premium-gradient text-black hover:opacity-90 shadow-neon-glow'}`}>
                                            {submitting ? "DEPLOYING..." : "Deploy For Final Audit"} <ArrowRight size={20} />
                                        </button>
                                        {message && <p className="mt-4 text-[10px] text-accent-cyan font-black text-center uppercase tracking-widest relative z-10">{message}</p>}
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex gap-6">
                        <GlassCard className="flex-1 p-6 border-white/5 flex items-center gap-4 group hover:border-accent-cyan/30 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                                <Info size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white mb-0.5">Audit Trail</p>
                                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">View full regulatory history</p>
                            </div>
                        </GlassCard>
                        <GlassCard className="flex-1 p-6 border-white/5 flex items-center gap-4 group hover:border-accent-secondary/30 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center text-accent-secondary">
                                <Cpu size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white mb-0.5">Verification Engine</p>
                                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">AI Status: Scanning Documents</p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            <div className="mt-20 opacity-20 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.5em]">256-BIT SECURE IDENTITY PROTOCOL v9.0 // ECOSYSTEM OF SMART INVESTING</p>
            </div>
        </div>
    );
}
