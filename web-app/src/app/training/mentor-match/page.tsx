"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Search,
    MapPin,
    Star,
    Award,
    MessageSquare,
    Calendar,
    ShieldCheck,
    Zap,
    ChevronRight,
    TrendingUp,
    Activity,
    Cpu,
    Target,
    Fingerprint
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const mentors = [
    {
        id: "m1",
        name: "Dr. Arvinder Singh",
        title: "Chief Quant Strategist, Capital Wealth",
        location: "Mumbai, MH",
        rating: 4.9,
        mentees: 12,
        specialty: "Algorithmic Trading & Compliance",
        matchScore: 98,
        availability: "Available Next Cycle",
        bio: "Specializes in guiding elite trainees through the SEBI dual-registration mandate and high-fidelity algorithmic backtesting protocols.",
        tags: ["Quant Node", "SEBI Authority", "Institutional Alpha"]
    },
    {
        id: "m2",
        name: "Priya Sharma",
        title: "Senior Estate Architect",
        location: "Delhi, DL",
        rating: 4.8,
        mentees: 8,
        specialty: "Estate Trust & Fiduciary Tax",
        matchScore: 85,
        availability: "Immediate Uplink",
        bio: "Focuses on client psychology, onboarding neural workflows, and constructing multi-generational legacy wealth silos.",
        tags: ["Estate Vault", "Tax Cipher", "Interlinked Relations"]
    },
    {
        id: "m3",
        name: "Vikram Malhotra",
        title: "Options Desk Protocol Lead",
        location: "Bengaluru, KA",
        rating: 4.9,
        mentees: 15,
        specialty: "F&O Risk Mitigation",
        matchScore: 72,
        availability: "Waitlisted (14 Days)",
        bio: "Former institutional desk lead. Mentors exclusively on advanced hedging ciphers and systemic portfolio stress testing.",
        tags: ["Derivatives", "Risk Sovereign"]
    }
];

export default function MentorMatching() {
    const [selectedMentor, setSelectedMentor] = useState(mentors[0].id);

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-12 flex flex-col md:flex-row gap-12 relative overflow-hidden">
            <SectionHighlight className="top-[-10%] left-[-5%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] right-[-5%]" color="cyan" />

            {/* Matrix Search & List */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col h-[calc(100vh-120px)] relative z-10">
                <header className="mb-10 space-y-4">
                    <NeonBadge text="AI MENTOR MATCHING v9.0" icon={Cpu} />
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic flex items-center gap-4">
                        <Users className="text-accent-secondary shadow-neon-glow" size={40} />
                        Neural <span className="text-transparent bg-clip-text bg-premium-gradient">Network</span>
                    </h1>
                    <p className="text-lg text-text-secondary font-medium italic opacity-80">Identify your fiduciary architect.</p>
                </header>

                <div className="relative mb-10 group shrink-0">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="INDEX SEARCH: SPECIALTY, NAME, OR NODE..."
                        className="w-full bg-black/40 border border-white/5 rounded-[28px] py-5 pl-16 pr-8 outline-none focus:border-accent-secondary transition-all text-xs font-black tracking-widest uppercase"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                    {mentors.map((mentor) => (
                        <motion.div
                            key={mentor.id}
                            onClick={() => setSelectedMentor(mentor.id)}
                            layout
                            className={`p-8 rounded-[36px] border cursor-pointer transition-all duration-500 relative overflow-hidden group ${selectedMentor === mentor.id
                                    ? 'bg-accent-secondary/[0.05] border-accent-secondary shadow-neon-glow !shadow-accent-secondary/5'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-2xl font-black italic relative z-10 group-hover:scale-105 transition-transform">
                                        {mentor.name.charAt(0)}
                                        {mentor.rating >= 4.9 && (
                                            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-warning rounded-lg border-2 border-black flex items-center justify-center shadow-lg">
                                                <Award size={12} className="text-black" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-lg leading-tight uppercase tracking-tight italic">{mentor.name}</h3>
                                        <p className="text-[9px] text-accent-secondary uppercase font-black tracking-[0.2em]">{mentor.specialty}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="text-success font-black text-3xl italic tracking-tighter shadow-neon-glow-success">{mentor.matchScore}%</span>
                                    <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mt-1">Match Node</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted bg-black/40 p-4 rounded-2xl border border-white/5">
                                <span className="flex items-center gap-2"><MapPin size={14} className="text-accent-cyan" /> {mentor.location}</span>
                                <span className="flex items-center gap-2 text-warning"><Star size={14} className="fill-warning" /> {mentor.rating}</span>
                                <span className="flex items-center gap-2"><Activity size={14} className="text-accent-secondary" /> {mentor.mentees} SESSIONS</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Detailed Fiduciary Profile */}
            <div className="w-full md:w-1/2 lg:w-3/5 h-[calc(100vh-120px)] relative z-10">
                <AnimatePresence mode="wait">
                    {mentors.map(mentor => mentor.id === selectedMentor && (
                        <motion.div
                            key={mentor.id}
                            initial={{ opacity: 0, scale: 0.98, x: 30 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.98, x: -30 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="h-full relative"
                        >
                            <GlassCard className="h-full p-12 border-white/10 flex flex-col relative overflow-hidden shadow-2xl" neon>
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                    <ShieldCheck size={300} className="text-accent-secondary" />
                                </div>

                                <div className="flex justify-between items-start mb-12 relative z-10">
                                    <div className="flex items-center gap-8">
                                        <div className="w-28 h-28 rounded-[40px] bg-black border-2 border-white/10 flex items-center justify-center text-5xl font-black italic shadow-2xl group relative overflow-hidden">
                                            <motion.div
                                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute inset-0 bg-accent-secondary"
                                            />
                                            <span className="relative z-10">{mentor.name.charAt(0)}</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <h2 className="text-5xl font-black tracking-tighter uppercase italic">{mentor.name}</h2>
                                                <ShieldCheck className="text-success shadow-neon-glow-success" size={32} />
                                            </div>
                                            <p className="text-accent-secondary font-black text-lg tracking-tight uppercase italic">{mentor.title}</p>
                                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
                                                <span className="flex items-center gap-2"><MapPin size={16} /> {mentor.location}</span>
                                                <span className="flex items-center gap-2"><Fingerprint size={16} /> VERIFIED FIDUCIARY</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[32px] bg-accent-secondary/10 border border-accent-secondary/20 shadow-neon-glow">
                                        <Zap size={32} className="text-accent-secondary" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-8 mb-12 relative z-10">
                                    <GlassCard className="p-8 border-white/5 bg-black/40 text-center space-y-2">
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.3em]">AI Synthesis Score</p>
                                        <p className="text-4xl font-black text-success flex items-center justify-center gap-3 tracking-tighter italic shadow-neon-glow-success">
                                            {mentor.matchScore}% <Activity size={24} />
                                        </p>
                                    </GlassCard>
                                    <GlassCard className="p-8 border-white/5 bg-black/40 text-center space-y-2">
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.3em]">Fiduciary Rating</p>
                                        <p className="text-4xl font-black text-warning flex items-center justify-center gap-3 tracking-tighter italic">
                                            {mentor.rating} <Star size={24} className="fill-warning" />
                                        </p>
                                    </GlassCard>
                                    <GlassCard className="p-8 border-white/5 bg-black/40 text-center space-y-2">
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.3em]">Protocol Link</p>
                                        <p className="text-base font-black text-white h-[32px] flex items-center justify-center uppercase tracking-widest italic">
                                            {mentor.availability}
                                        </p>
                                    </GlassCard>
                                </div>

                                <div className="mb-12 relative z-10 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted border-b border-white/5 pb-4">Specialization Hub</h3>
                                    <p className="text-base leading-loose text-text-secondary font-medium italic opacity-80">{mentor.bio}</p>
                                    <div className="flex flex-wrap gap-4 mt-8">
                                        {mentor.tags.map(tag => (
                                            <NeonBadge key={tag} text={tag} color="purple" className="px-6 py-2" />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto space-y-8 relative z-10">
                                    <div className="p-8 rounded-[40px] bg-accent-secondary/[0.03] border border-accent-secondary/20 flex gap-8 items-center group overflow-hidden relative">
                                        <motion.div
                                            className="absolute bottom-0 left-0 h-1 bg-accent-secondary shadow-neon-glow"
                                            initial={{ width: 0 }}
                                            animate={{ width: "98%" }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <Target size={40} className="text-accent-secondary shrink-0 shadow-neon-glow" />
                                        <div>
                                            <h4 className="text-[10px] font-black text-accent-secondary uppercase tracking-[0.4em] mb-2">Neural Rationale</h4>
                                            <p className="text-[11px] text-text-secondary font-medium uppercase tracking-[0.1em] leading-relaxed italic">
                                                Your 90-day trajectory indicates a deficit in {mentor.specialty}. {mentor.name}'s previous cohorts have a 100% first-attempt SEBI throughput.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <PremiumButton variant="secondary" className="py-6 uppercase tracking-[0.3em] text-[10px] font-black">
                                            <MessageSquare size={20} className="mr-3" /> Initialize Relay
                                        </PremiumButton>
                                        <PremiumButton variant="primary" className="py-6 uppercase tracking-[0.3em] text-[10px] font-black shadow-neon-glow">
                                            <Calendar size={20} className="mr-3" /> Request Fiduciary Handshake
                                        </PremiumButton>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <footer className="fixed bottom-0 left-0 w-full py-8 text-center opacity-20 pointer-events-none">
                <p className="text-[9px] font-black uppercase tracking-[0.5em]">MENTOR NETWORK NODES: 412 ACTIVE // FIDUCIARY ECOSYSTEM</p>
            </footer>
        </div>
    );
}
