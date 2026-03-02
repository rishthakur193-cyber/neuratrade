"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    Lock,
    FileText,
    EyeOff,
    Server,
    CheckCircle2,
    Globe,
    Fingerprint,
    Award,
    AlertTriangle,
    Activity,
    Cpu,
    Target,
    Zap
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const compliancePillars = [
    {
        icon: FileText,
        title: "Regulated Genesis",
        accent: "#00E676",
        desc: "100% of network nodes are held by SEBI Registered Investment Advisors (RIA). Daily credential synchronization ensures zero unlicensed actors."
    },
    {
        icon: Lock,
        title: "AES-256 GCM Shield",
        accent: "#7C4DFF",
        desc: "PII and financial mandates are encrypted at rest via high-entropy keys and in transit via TLS 1.3. Your wealth data is vault-secured."
    },
    {
        icon: EyeOff,
        title: "Zero-Knowledge Nodes",
        accent: "#00E5FF",
        desc: "The ecosystem operates on read-only permissions. We never store or access broker credentials, ensuring total fund sovereignty."
    },
    {
        icon: Fingerprint,
        title: "Biometric KYC",
        accent: "#E040FB",
        desc: "Identity verified via UIDAI DigiLocker bridge. Multi-factor authentication prevents unauthorized mandate execution."
    },
    {
        icon: Server,
        title: "Sovereign Infrastructure",
        accent: "#FFAB40",
        desc: "In strict compliance with CERT-In directives, all ecosystem data resides within Tier-4 data centers on Indian soil."
    },
    {
        icon: AlertTriangle,
        title: "AI Threat Radar",
        accent: "#FF5252",
        desc: "Neural networks scan for pump-and-dump anomalies or fiduciary breaches. Immediate automated suspension on detection."
    }
];

export default function TrustCenter() {
    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-12 relative overflow-hidden">
            <SectionHighlight className="top-[-10%] right-[-5%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] left-[-5%]" color="cyan" />

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

            <header className="mb-24 text-center max-w-5xl mx-auto relative z-10 pt-16">
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 rounded-[32px] bg-success/10 border-2 border-success/30 text-success flex items-center justify-center shadow-neon-glow-success relative">
                        <ShieldCheck size={56} />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-success/20 rounded-[32px]"
                        />
                    </div>
                </div>
                <NeonBadge text="CERTIFIED FIDUCIARY ECOSYSTEM v9.0" className="mx-auto mb-6" icon={Lock} />
                <h1 className="text-7xl font-black tracking-tighter mb-8 uppercase italic leading-tight">
                    Nexus <span className="text-transparent bg-clip-text bg-premium-gradient">Fortress</span>
                </h1>
                <p className="text-2xl text-text-secondary font-medium italic leading-relaxed max-w-3xl mx-auto">
                    Institutional confidence engineered from the ground up. We eliminate the friction of trust via automated compliance.
                </p>
            </header>

            <main className="max-w-7xl mx-auto relative z-10 space-y-24 px-4">

                {/* Live Integrity Dashboard */}
                <div className="p-12 rounded-[48px] bg-white/[0.03] border border-success/20 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="flex flex-col lg:flex-row gap-12 items-center justify-between relative z-10">
                        <div className="flex items-center gap-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-success/20 flex items-center justify-center text-success relative">
                                    <CheckCircle2 size={48} className="shadow-neon-glow-success" />
                                    <motion.div
                                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 border-4 border-success rounded-full"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black tracking-tighter uppercase italic">Architecture: SECURE</h3>
                                <p className="text-success font-black text-xs tracking-[0.2em] uppercase flex items-center gap-3">
                                    <Globe size={18} className="animate-spin-slow" /> ACTIVE THREAT RADAR: 0 ANOMALIES
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center w-full lg:w-auto">
                            {[
                                { label: "Uptime", val: "99.99%" },
                                { label: "Encryption", val: "AES-256" },
                                { label: "Fraud Blocks", val: "12.4K", icon: TrendingUp },
                                { label: "Last Audit", val: "Today" }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-2">
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em]">{stat.label}</p>
                                    <p className="text-3xl font-black text-white tracking-tighter flex items-center justify-center gap-2">
                                        {stat.val} {stat.icon && <stat.icon size={18} className="text-success" />}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 6 Pillars Strategy */}
                <div className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">The Infrastructure of Trust</h2>
                        <h3 className="text-5xl font-black tracking-tighter uppercase italic">Institutional Pillars</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {compliancePillars.map((pillar, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                className="group"
                            >
                                <GlassCard className="p-10 border-white/5 h-full transition-all duration-500 hover:border-white/20 hover:scale-[1.02] relative overflow-hidden" neon>
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity" style={{ color: pillar.accent }}>
                                        <pillar.icon size={64} />
                                    </div>
                                    <div className="w-16 h-16 rounded-[20px] bg-black border border-white/10 flex items-center justify-center mb-8 shadow-lg group-hover:shadow-neon-glow transition-all" style={{ color: pillar.accent }}>
                                        <pillar.icon size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight tracking-widest">{pillar.title}</h3>
                                    <p className="text-[11px] text-text-muted font-medium leading-loose uppercase tracking-widest">
                                        {pillar.desc}
                                    </p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Certification Rig */}
                <div className="py-24 border-y border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-accent-secondary/5 blur-[100px] opacity-30" />
                    <div className="relative z-10 space-y-12">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted mb-8 text-center opacity-40">Certified Industrial Infrastructure</p>
                        <div className="flex flex-wrap justify-center gap-16 md:gap-32 opacity-30 hover:opacity-100 transition-opacity duration-700">
                            {[
                                { name: "ISO 27001", icon: ShieldCheck },
                                { name: "SOC 2 TYPE II", icon: Lock },
                                { name: "CERT-IN", icon: Globe },
                                { name: "PCI-DSS", icon: CreditCard }
                            ].map((cert, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-default">
                                    <cert.icon size={40} className="group-hover:text-accent-cyan transition-colors" />
                                    <span className="font-black text-2xl tracking-tighter uppercase italic">{cert.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bounty Terminal */}
                <div className="pb-32 flex justify-center">
                    <GlassCard className="p-16 border-danger/30 text-center max-w-4xl w-full bg-gradient-to-b from-danger/5 to-black/40 relative overflow-hidden group shadow-neon-glow-danger" neon>
                        <div className="absolute top-0 right-0 p-12 opacity-5 animate-pulse text-danger">
                            <Activity size={200} />
                        </div>
                        <AlertTriangle size={64} className="text-danger mx-auto mb-8 animate-bounce transition-transform" />
                        <h3 className="text-4xl font-black mb-6 uppercase tracking-tight italic">Security Bounty Node</h3>
                        <p className="text-text-secondary text-base mb-10 leading-relaxed font-medium italic">
                            Help us fortify the Ecosystem. We reward security researchers who identify critical vulnerabilities in our banking nodes, high-fidelity AI matching, or fiduciary vaults.
                            <span className="block mt-4 text-white font-black text-xl italic uppercase tracking-tighter">P1 Zero-Day: Up to ₹10,00,000</span>
                        </p>
                        <PremiumButton variant="secondary" className="scale-110 !border-danger !text-danger hover:!bg-danger hover:!text-white uppercase tracking-[0.2em] text-[10px]">
                            Initialize Report Protocol
                        </PremiumButton>
                    </GlassCard>
                </div>

            </main>

            <footer className="py-12 text-center opacity-30 relative z-10 border-t border-white/5">
                <div className="flex justify-center items-center gap-8 text-[9px] font-black uppercase tracking-[0.5em]">
                    <Cpu size={14} /> TRUST INFRASTRUCTURE v0.9-STABLE <ShieldCheck size={14} />
                </div>
            </footer>
        </div>
    );
}

function TrendingUp(props: any) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

function CreditCard(props: any) {
    return (
        <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
    );
}
