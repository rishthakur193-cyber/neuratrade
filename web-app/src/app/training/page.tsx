"use client";
// @ts-nocheck
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    GraduationCap,
    Map,
    CheckCircle2,
    Clock,
    FileText,
    UserPlus,
    ChevronRight,
    TrendingUp,
    Award,
    BookOpen,
    PlayCircle,
    Zap,
    Cpu,
    Target,
    Activity,
    ShieldCheck
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const initialJourneySteps = [
    { id: 'genesis', day: "PHASE 01: DAYS 1-15", title: "GENESIS FOUNDATION", desc: "Initialize NISM Series X-A certification and gather core identity payloads.", status: "completed" },
    { id: 'entity', day: "PHASE 02: DAYS 16-45", title: "ENTITY PROTOCOL", desc: "Construct individual/corporate mandate structures and regulatory tax signatures.", status: "current" },
    { id: 'sebi', day: "PHASE 03: DAYS 46-75", title: "SEBI MANTLE", desc: "Submit Form-A compliance cipher and negotiate regulatory handshake queries.", status: "upcoming" },
    { id: 'launch', day: "PHASE 04: DAYS 76-90", title: "MANDATE LAUNCH", desc: "Finalize compliance node audits and initialize your first verified alpha stream.", status: "upcoming" },
];

const initialCourses = [
    { id: 'NISM-XA', title: "Compliance Mastery", duration: "12Hours", lessons: 8, progress: 0, accent: "success" },
    { id: 'SEBI-COMP', title: "Quant Portfolio Theory", duration: "24Hours", lessons: 15, progress: 0, accent: "purple" },
    { id: 'CLIENT-PSY', title: "Client Acquisition Ethics", duration: "6Hours", lessons: 4, progress: 0, accent: "cyan" },
];

export default function TrainingPlatform() {
    const [progressRecords, setProgressRecords] = useState<any[]>([]);
    const [journeySteps, setJourneySteps] = useState(initialJourneySteps);
    const [courses, setCourses] = useState(initialCourses);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('ecosystem_user') || '{}').token;
                const res = await fetch('/api/training/progress', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.progress) {
                    setProgressRecords(data.progress);
                    // Update course progress in local state
                    const updatedCourses = courses.map(course => {
                        const record = data.progress.find((p: any) => p.courseId === course.id);
                        return record ? { ...course, progress: record.progress } : course;
                    });
                    setCourses(updatedCourses);
                }
            } catch (err) {
                console.error("Failed to fetch progress:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgress();
    }, []);

    const handleUpdateProgress = async (courseId: string, currentProgress: number) => {
        const newProgress = Math.min(currentProgress + 10, 100);
        try {
            const userData = localStorage.getItem('ecosystem_user');
            if (!userData) return;
            const token = JSON.parse(userData).token;

            await fetch('/api/training/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ courseId, progress: newProgress })
            });

            // Optimistic update
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, progress: newProgress } : c));
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const globalProgressTotal = courses.reduce((acc, c) => acc + c.progress, 0) / courses.length;

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white p-12 relative overflow-hidden">
            <SectionHighlight className="top-[-10%] right-[-5%]" color="purple" />
            <SectionHighlight className="bottom-[-10%] left-[-5%]" color="cyan" />

            <header className="mb-24 text-center max-w-5xl mx-auto relative z-10 pt-16">
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 rounded-[32px] bg-accent-secondary/10 border-2 border-accent-secondary/30 text-accent-secondary flex items-center justify-center shadow-neon-glow relative group">
                        <GraduationCap size={56} className="group-hover:scale-110 transition-transform" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-10px] border border-dashed border-accent-secondary/20 rounded-full"
                        />
                    </div>
                </div>
                <NeonBadge text="ACADEMY PROTOCOL v2.1: ELITE ADVISORY" className="mx-auto mb-6" icon={Zap} />
                <h1 className="text-7xl font-black tracking-tighter uppercase italic leading-tight mb-8">
                    The <span className="text-transparent bg-clip-text bg-premium-gradient">Mantle</span> Program
                </h1>
                <p className="text-2xl text-text-secondary font-medium italic leading-relaxed max-w-3xl mx-auto">
                    The definitive 90-day architect's roadmap to constructing a legal, scalable, and verified advisory infrastructure.
                </p>

                <div className="mt-12 max-w-sm mx-auto p-1 bg-white/5 rounded-full border border-white/10 flex items-center justify-between pl-6 pr-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Global Progress</span>
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-black italic shadow-neon-glow">{Math.round(globalProgressTotal)}%</span>
                        <div className="w-32 h-10 rounded-full bg-accent-secondary shadow-neon-glow flex items-center justify-center">
                            <Zap size={18} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10 px-4 pb-32">
                {/* 90-Day Execution Logic */}
                <div className="lg:col-span-8 space-y-12">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <h3 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-5">
                            <Map className="text-accent-secondary shadow-neon-glow" size={32} />
                            Chronos Roadmap
                        </h3>
                        <PremiumButton variant="secondary" className="scale-75 uppercase tracking-[0.2em] text-[10px]">
                            Full Index <ChevronRight size={16} />
                        </PremiumButton>
                    </div>

                    <div className="relative pl-12 space-y-16 before:absolute before:left-5 before:top-4 before:bottom-0 before:w-px before:bg-white/5">
                        {journeySteps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                className="relative"
                            >
                                <div className={`absolute -left-12 top-2 w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 z-10 ${step.status === 'completed' ? 'bg-success border-transparent text-white shadow-neon-glow-success' :
                                    step.status === 'current' ? 'bg-accent-secondary border-transparent text-white shadow-neon-glow animate-pulse' :
                                        'bg-black border-white/10 text-white/20'
                                    }`}>
                                    {step.status === 'completed' ? <CheckCircle2 size={24} /> : <span className="text-xs font-black">{i + 1}</span>}
                                </div>

                                <GlassCard className={`p-10 border-white/5 transition-all duration-500 overflow-hidden relative ${step.status === 'current' ? 'border-accent-secondary/30 bg-accent-secondary/[0.02]' : ''
                                    }`} neon={step.status === 'current'}>
                                    {step.status === 'current' && (
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Activity size={100} className="text-accent-secondary" />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${step.status === 'completed' ? 'text-success' :
                                            step.status === 'current' ? 'text-accent-secondary shadow-neon-glow' :
                                                'text-text-muted'
                                            }`}>{step.day}</span>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${step.status === 'completed' ? 'bg-success shadow-neon-glow-success' :
                                                step.status === 'current' ? 'bg-accent-secondary shadow-neon-glow' :
                                                    'bg-white/10'
                                                }`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">
                                                {step.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <h4 className="text-3xl font-black mb-4 uppercase tracking-tighter italic">{step.title}</h4>
                                    <p className="text-sm text-text-muted leading-loose font-medium italic opacity-80">{step.desc}</p>

                                    {step.status === 'current' && (
                                        <div className="mt-10 flex gap-6">
                                            <PremiumButton variant="primary" className="flex-1 py-4 text-[10px] uppercase tracking-widest shadow-neon-glow">
                                                Initialize Handshake
                                            </PremiumButton>
                                            <PremiumButton variant="secondary" className="flex-1 py-4 text-[10px] uppercase tracking-widest">
                                                Consult Mentor
                                            </PremiumButton>
                                        </div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Cognitive Layer sidebar */}
                <div className="lg:col-span-4 space-y-12">
                    {/* Neural Curriculum */}
                    <section className="space-y-8">
                        <h3 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-4">
                            <BookOpen className="text-accent-cyan shadow-neon-glow" size={24} />
                            Active Sync
                        </h3>
                        <div className="space-y-6">
                            {courses.map((course, i) => (
                                <GlassCard
                                    key={i}
                                    className="p-8 border-white/5 transition-all hover:border-white/20 group cursor-pointer relative overflow-hidden"
                                    neon={course.progress > 0 && course.progress < 100}
                                    onClick={() => handleUpdateProgress(course.id, course.progress)}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <h4 className="font-black text-sm uppercase tracking-tight italic group-hover:text-accent-secondary transition-colors">{course.title}</h4>
                                            <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">{course.duration} // {course.lessons} OBJECTS</p>
                                        </div>
                                        <PlayCircle size={28} className="text-white/20 group-hover:text-accent-secondary transition-all group-hover:scale-110" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-text-muted italic">Sync Progress</span>
                                            <span className={`${course.progress === 100 ? 'text-success' : 'text-white'}`}>{course.progress}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${course.progress}%` }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className={`h-full ${course.progress === 100 ? 'bg-success shadow-neon-glow-success' : 'bg-accent-secondary shadow-neon-glow'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                        <PremiumButton variant="secondary" className="w-full text-xs uppercase tracking-[0.3em] py-5">
                            Browse Knowledge Index
                        </PremiumButton>
                    </section>

                    {/* Fiduciary Ladder */}
                    <GlassCard className="p-10 border-accent-secondary/10 bg-gradient-to-br from-accent-secondary/5 to-transparent relative overflow-hidden group" neon>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Award size={120} />
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-4 mb-10">
                            <TrendingUp className="text-accent-secondary shadow-neon-glow" size={24} />
                            The Ascent
                        </h3>
                        <div className="space-y-10">
                            {[
                                { id: 1, title: "Candidate Node", desc: "NISM Certification Payload", active: true },
                                { id: 2, title: "Verified Hub", desc: "₹50Cr Mandate + 2Y Audit", active: false },
                                { id: 3, title: "Elite Sovereign", desc: "Proprietary Strategy Engine", active: false }
                            ].map((rank) => (
                                <div key={rank.id} className={`flex gap-6 items-start transition-opacity duration-500 ${rank.active ? 'opacity-100' : 'opacity-20'}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic border ${rank.active ? 'bg-accent-secondary text-white border-transparent shadow-neon-glow' : 'bg-transparent border-white/10 text-white/40'
                                        }`}>
                                        {rank.id}
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-sm font-black uppercase tracking-tight italic">{rank.title}</h5>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{rank.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Mentor Relay */}
                    <div className="p-8 rounded-[36px] bg-success/5 border border-success/20 flex items-center gap-6 relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-neon-glow-success transition-all duration-500">
                        <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="w-16 h-16 rounded-[20px] overflow-hidden border-2 border-success shadow-neon-glow-success relative z-10">
                                <img src="https://ui-avatars.com/api/?name=RS&background=00E676&color=fff" alt="Mentor" className="scale-110" />
                            </div>
                        </div>
                        <div className="relative z-10 flex-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-success mb-1 italic flex items-center gap-2">
                                <Activity size={10} /> Active Mentor Relay
                            </p>
                            <p className="text-sm font-black uppercase tracking-tight text-white mb-1">RAKESH SHARMA</p>
                            <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">RANK: ELITE SOVEREIGN</p>
                        </div>
                        <ChevronRight size={24} className="text-success group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 w-full py-8 text-center opacity-30 pointer-events-none border-t border-white/5 bg-black/80 backdrop-blur-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.5em]">ACADEMY PROTOCOL // GENESIS OF FIDUCIARY INTELLIGENCE</p>
            </footer>
        </div>
    );
}

