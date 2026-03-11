'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Users, Award, ArrowUpRight } from 'lucide-react';
import { InviteShare } from '@/components/growth/InviteShare';
import { GrowthService, RewardData } from '@/services/growth.service';

export const ReferralDashboard = () => {
    const [rewards, setRewards] = useState<RewardData | null>(null);
    const [referralCode, setReferralCode] = useState<string>('');

    useEffect(() => {
        GrowthService.getMyRewards().then(setRewards).catch(console.error);
        GrowthService.getReferralCode().then(setReferralCode).catch(console.error);
    }, []);

    if (!rewards) return null;

    return (
        <div className="bg-[#0f172a] border border-[#334155] rounded-2xl p-6 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#69F0AE]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-[#69F0AE]/10" />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#69F0AE]/10 rounded-xl border border-[#69F0AE]/20">
                        <Trophy className="text-[#69F0AE]" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Your Growth</h3>
                        <p className="text-sm text-[#94a3b8]">Level {rewards.level} Strategist</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-white">{rewards.points}</p>
                    <p className="text-[10px] text-[#69F0AE] font-bold uppercase tracking-widest">Neura Points</p>
                </div>
            </div>

            {/* Level Progress */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-[#94a3b8] mb-2 uppercase tracking-tight">
                    <span>Level {rewards.level}</span>
                    <span>Level {rewards.level + 1}</span>
                </div>
                <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden border border-[#334155]">
                    <div
                        className="h-full bg-gradient-to-r from-[#69F0AE] to-[#00E676] shadow-[0_0_10px_rgba(105,240,174,0.5)] transition-all duration-1000"
                        style={{ width: `${(rewards.points % 1000) / 10}%` }}
                    />
                </div>
                <p className="text-[10px] text-center text-[#64748b] mt-2 italic">
                    {1000 - (rewards.points % 1000)} points until your next milestone
                </p>
            </div>

            {/* Referral Section */}
            <div className="bg-[#1e293b]/50 border border-[#334155] rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="text-[#69F0AE]" size={18} />
                    <h4 className="text-sm font-bold text-white">Invite & Earn</h4>
                </div>
                <p className="text-xs text-[#94a3b8] mb-6 leading-relaxed italic">
                    Invite fellow investors to NeuraTrade. You both earn <span className="text-[#69F0AE] font-bold">100 points</span> upon their successful joining.
                </p>

                <InviteShare referralCode={referralCode} />
            </div>

            {/* Badges */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Award className="text-[#69F0AE]" size={18} />
                    <h4 className="text-sm font-bold text-white">Unlocked Badges</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                    {rewards.badges.map((badge, idx) => (
                        <div
                            key={idx}
                            className="bg-[#334155]/30 border border-[#475569] px-3 py-1.5 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="w-2 h-2 rounded-full bg-[#69F0AE] shadow-[0_0_5px_#69F0AE]" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{badge}</span>
                        </div>
                    ))}
                    {rewards.badges.length === 0 && (
                        <p className="text-[10px] text-[#475569] italic">No badges unlocked yet. Start inviting!</p>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#334155]/50 flex justify-center">
                <button className="text-[10px] font-bold text-[#69F0AE] hover:text-[#00E676] flex items-center gap-1 uppercase tracking-widest transition-colors">
                    View Full Rewards History <ArrowUpRight size={12} />
                </button>
            </div>
        </div>
    );
};
