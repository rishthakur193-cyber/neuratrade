"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    GraduationCap,
    BookOpen,
    Map,
    CheckCircle2,
    Clock,
    Zap,
    Trophy,
    LayoutDashboard,
    Award,
    Calendar,
    ArrowRight,
    TrendingUp,
    Target,
    Users,
    ChevronRight,
    Star,
    MessageSquare,
    Play,
    LogOut
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const defaultCourseProgress = [
    { courseId: "NISM-XA", name: "NISM Series X-A (L1)", progress: 0, lessons: "0/14" },
    { courseId: "SEBI-COMP", name: "Compliance Essentials", progress: 0, lessons: "0/10" },
    { courseId: "CLIENT-PSY", name: "Client Psychology", progress: 0, lessons: "0/8" },
];

export default function TraineeDashboard() {
    const [user, setUser] = useState<any>(null);
    const [courseProgressData, setCourseProgressData] = useState<any[]>(defaultCourseProgress);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "/auth/login";
                return;
            }

            try {
                const res = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.role !== 'TRAINEE') {
                        window.location.href = '/dashboard';
                        return;
                    }
                    setUser(data);
                }

                const progressRes = await fetch('/api/training/progress', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (progressRes.ok) {
                    const progressData = await progressRes.json();
                    if (progressData.progress && progressData.progress.length > 0) {
                        const mergedProgress = defaultCourseProgress.map(dc => {
                            const dbRecord = progressData.progress.find((p: any) => p.courseId === dc.courseId);
                            const totalLessons = parseInt(dc.lessons.split('/')[1]);
                            const completed = dbRecord ? Math.round((dbRecord.progress / 100) * totalLessons) : 0;
                            return {
                                ...dc,
                                progress: dbRecord ? dbRecord.progress : dc.progress,
                                lessons: `${completed}/${totalLessons}`
                            };
                        });
                        setCourseProgressData(mergedProgress);
                    }
                }
            } catch (err) {
                console.error("Trainee Dashboard Fetch Error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0B12] flex items-center justify-center">
                <div className="text-accent-primary animate-pulse font-black tracking-[0.3em] text-sm flex items-center gap-3">
                    <GraduationCap size={20} /> INITIALIZING ACADEMY ACCESS...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B12] text-white flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col p-8 space-y-10 relative z-20">
                <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-premium-gradient flex items-center justify-center shadow-neon-glow">
                        <GraduationCap size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter leading-none text-accent-secondary">ACADEMY</span>
                        <span className="text-[8px] font-bold text-text-muted tracking-[0.2em] uppercase">Trainee Mission Control</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    <SidebarItem icon={LayoutDashboard} label="Mission Control" active />
                    <SidebarItem icon={BookOpen} label="Curriculum Hub" />
                    <SidebarItem icon={Map} label="90-Day Roadmap" />
                    <SidebarItem icon={Target} label="Exam Simulations" />
                    <SidebarItem icon={Award} label="Achievements" />
                </nav>

                <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="p-5 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 relative overflow-hidden group">
                        <p className="text-[10px] text-accent-primary font-bold uppercase tracking-widest mb-1">Sprint Progress</p>
                        <h4 className="text-sm font-black text-white">NISM Certification</h4>
                        <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-primary w-[85%]" />
                        </div>
                    </div>
                    <SidebarItem icon={LogOut} label="Secure Sign Out" onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }} />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative bg-radial-highlights">
                {/* Header */}
                <header className="sticky top-0 z-30 flex justify-between items-center px-12 py-8 backdrop-blur-md bg-[#0B0B12]/60 border-b border-white/5">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1">
                            Your <span className="text-transparent bg-clip-text bg-premium-gradient">SEBI Journey</span>
                        </h1>
                        <p className="text-text-secondary text-sm font-medium">Day 14 of 90. You are in the top <span className="text-accent-secondary font-bold">18% of Trainees</span>.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                            <div className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
                            <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">Live Sprint active</span>
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/5">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-white">{user?.name || 'Trainee'}</p>
                                <p className="text-[10px] text-accent-primary font-bold uppercase tracking-widest">Candidate ID: #{user?.id?.substring(0, 6).toUpperCase()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-premium-gradient p-[1px]">
                                <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center font-black text-accent-primary">
                                    {user?.name ? user.name[0].toUpperCase() : 'T'}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-12 space-y-12">
                    {/* Sprint Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <GlassCard className="lg:col-span-2 p-8 relative overflow-hidden" neon>
                            <div className="flex justify-between items-center mb-10 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <Zap className="text-accent-secondary" size={20} />
                                        SPRINT PROGRESS
                                    </h3>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">March 2026 Cohort</p>
                                </div>
                                <PremiumButton variant="secondary" className="scale-75 origin-right">Learning Path</PremiumButton>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {courseProgressData.map((course, i) => (
                                    <div key={i} className="space-y-6">
                                        <div className="flex justify-between items-baseline">
                                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest truncate max-w-[120px]">{course.name}</h4>
                                            <span className="text-sm font-black text-accent-primary">{course.progress}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${course.progress}%` }}
                                                transition={{ duration: 1.5, delay: i * 0.2 }}
                                                className="h-full bg-accent-primary shadow-[0_0_15px_rgba(124,77,255,0.4)]"
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold text-text-secondary">
                                            <span>Units Complete</span>
                                            <span className="text-white">{course.lessons}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-black tracking-tight mb-6">NEXT TASK</h3>
                                <div className="p-5 rounded-2xl bg-white/5 border-l-4 border-accent-secondary">
                                    <p className="text-sm font-bold text-white mb-2">NISM Series X-A Mock Test #3</p>
                                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold mb-4">
                                        <Clock size={12} />
                                        <span>STARTS IN 4H 20M</span>
                                    </div>
                                    <PremiumButton variant="primary" className="w-full !py-2.5 text-xs">Join Session</PremiumButton>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 mt-6">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-muted">
                                    <span>Daily Streak</span>
                                    <span className="text-accent-secondary">🔥 14 Days</span>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Roadmap & Mentorship */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <GlassCard className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black tracking-tight uppercase tracking-widest">90-Day Journey Roadmap</h3>
                                <span className="text-[10px] font-bold text-accent-secondary bg-accent-secondary/10 px-3 py-1 rounded-full uppercase">On Track</span>
                            </div>
                            <div className="space-y-6 relative">
                                <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />
                                <RoadmapStep title="NISM Certification" date="MAR 15" status="active" />
                                <RoadmapStep title="Entity Registration" date="APR 05" status="pending" />
                                <RoadmapStep title="Compliance Setup" date="APR 20" status="pending" />
                                <RoadmapStep title="Ecosystem Onboarding" date="MAY 10" status="pending" />
                            </div>
                        </GlassCard>

                        <div className="space-y-8">
                            <GlassCard className="p-8 border-accent-secondary/30" neon>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-premium-gradient flex items-center justify-center text-white">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black tracking-tight">MENTOR FEEDBACK</h3>
                                            <p className="text-[10px] font-bold text-accent-secondary uppercase tracking-widest">Dr. Arvinder Singh</p>
                                        </div>
                                    </div>
                                    <MessageSquare className="text-accent-secondary opacity-50" size={20} />
                                </div>
                                <div className="p-5 rounded-2xl bg-white/5 italic text-sm text-text-secondary leading-relaxed font-medium">
                                    "Your mock score in Compliance was outstanding (92%). Focus on the 'Conflict of Interest' modules for your next sprint. We'll discuss entity types on Tuesday."
                                </div>
                                <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-white/10 text-text-muted text-[10px] font-black hover:text-white hover:border-accent-secondary transition-all uppercase tracking-[0.2em]">
                                    Schedule 1:1 Strategy Call
                                </button>
                            </GlassCard>

                            <div className="grid grid-cols-2 gap-6">
                                <AchievementBadge icon={Trophy} label="Elite Scorer" status="Unlocked" />
                                <AchievementBadge icon={Star} label="Fiduciary Oath" status="Locked" locked />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 relative group ${active
                ? "bg-accent-primary/10 text-white font-bold"
                : "text-text-muted hover:text-white"
                }`}>
            {active && (
                <motion.div
                    layoutId="sidebar-active-trainee"
                    className="absolute left-0 w-1 h-6 bg-accent-primary rounded-r-full shadow-neon-glow"
                />
            )}
            <Icon size={18} className={`${active ? 'text-accent-primary' : 'group-hover:text-accent-primary'} transition-colors`} />
            <span className="text-sm tracking-tight">{label}</span>
        </div>
    );
}

function RoadmapStep({ title, date, status }: { title: string, date: string, status: 'active' | 'pending' | 'complete' }) {
    return (
        <div className="flex items-center justify-between pl-14 relative">
            <div className={`absolute left-[20px] w-2 h-2 rounded-full border-2 ${status === 'active' ? 'bg-accent-primary border-accent-primary shadow-[0_0_10px_rgba(124,77,255,0.8)]' : status === 'complete' ? 'bg-success border-success' : 'bg-background-primary border-white/20'}`} />
            <div>
                <span className={`text-sm font-black ${status === 'active' ? 'text-white' : 'text-text-muted'}`}>{title}</span>
                <p className="text-[10px] text-text-muted font-bold uppercase">{date}</p>
            </div>
            {status === 'active' && <button className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white transition-all"><Play size={12} fill="currentColor" /></button>}
        </div>
    );
}

function AchievementBadge({ icon: Icon, label, status, locked }: { icon: any, label: string, status: string, locked?: boolean }) {
    return (
        <GlassCard className={`p-6 flex flex-col items-center justify-center text-center gap-3 ${locked ? 'opacity-30 grayscale' : ''}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${locked ? 'bg-white/5 text-text-muted' : 'bg-accent-secondary/10 text-accent-secondary shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-accent-secondary/20'}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-white tracking-widest">{label}</p>
                <p className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">{status}</p>
            </div>
        </GlassCard>
    );
}
