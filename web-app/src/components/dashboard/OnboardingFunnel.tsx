'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard, PremiumButton, NeonBadge } from '@/components/ui/PremiumUI';
import { CheckCircle2, Circle, ArrowRight, Shield, Zap, Wallet, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const OnboardingFunnel = ({ userType }: { userType: 'INVESTOR' | 'ADVISOR' }) => {
    const [progress, setProgress] = useState(0);
    const [steps, setSteps] = useState([
        { id: 'kyc', label: 'Identity Verification', completed: false, icon: Shield, action: '/kyc' },
        { id: 'profile', label: 'Strategy Alignment', completed: true, icon: Zap, action: '/investor/matching' },
        { id: 'broker', label: 'Broker Integration', completed: false, icon: Wallet, action: '/portfolio/connect' },
        { id: 'referral', label: 'Join Growth Network', completed: false, icon: Users, action: '/dashboard' },
    ]);

    useEffect(() => {
        const completedCount = steps.filter(s => s.completed).length;
        setProgress((completedCount / steps.length) * 100);
    }, [steps]);

    return (
        <GlassCard className="p-8 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black tracking-tighter uppercase italic">Onboarding Sequence</h3>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-60">System Ready: {Math.round(progress)}%</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center font-black text-xs text-accent-secondary">
                    {progress}%
                </div>
            </div>

            <div className="space-y-6">
                {steps.map((step, idx) => (
                    <div
                        key={step.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 cursor-pointer group/item ${step.completed ? 'bg-success/5 border-success/20 opacity-60' : 'bg-white/[0.02] border-white/5 hover:border-accent-secondary/50'
                            }`}
                        onClick={() => !step.completed && (window.location.href = step.action)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${step.completed ? 'bg-success/10 border-success/30 text-success' : 'bg-black/40 border-white/10 text-text-muted group-hover/item:border-accent-secondary/50'
                                }`}>
                                {step.completed ? <CheckCircle2 size={18} /> : <step.icon size={18} />}
                            </div>
                            <div>
                                <span className={`text-xs font-black uppercase tracking-widest block ${step.completed ? 'text-success' : 'text-white'}`}>
                                    {step.label}
                                </span>
                                <span className="text-[8px] text-text-muted font-bold uppercase tracking-widest opacity-40">
                                    {step.completed ? 'Verified & Optimal' : 'Action Required'}
                                </span>
                            </div>
                        </div>
                        {!step.completed && <ArrowRight size={14} className="text-accent-secondary animate-pulse" />}
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] text-text-muted font-medium italic leading-relaxed mb-6 opacity-60">
                    Complete your institutional handshake to unlock full mandate capabilities and direct market execution.
                </p>
                <PremiumButton
                    variant="primary"
                    className="w-full py-4 text-[10px] tracking-[0.2em] shadow-neon-glow"
                    onClick={() => { }}
                >
                    INITIALIZE NEXT VECTOR
                </PremiumButton>
            </div>
        </GlassCard>
    );
};
