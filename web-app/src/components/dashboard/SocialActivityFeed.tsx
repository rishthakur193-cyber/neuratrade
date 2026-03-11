'use client';

import React, { useEffect, useState } from 'react';
import { GrowthService, ActivityData } from '@/services/growth.service';
import { Activity, UserPlus, Zap, Award, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SocialActivityFeed = () => {
    const [activities, setActivities] = useState<ActivityData[]>([]);

    useEffect(() => {
        // Initial fetch
        GrowthService.getActivities().then(setActivities).catch(console.error);

        // Real-time updates via WebSocket (can be added if needed)
        // For now, simpler polling or just initial fetch is enough
        const interval = setInterval(() => {
            GrowthService.getActivities().then(setActivities).catch(console.error);
        }, 10000); // 10s refresh

        return () => clearInterval(interval);
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'JOINED': return <UserPlus className="text-blue-400" size={14} />;
            case 'PUBLISHED': return <Zap className="text-yellow-400" size={14} />;
            case 'EARNED_BADGE': return <Award className="text-purple-400" size={14} />;
            default: return <Activity className="text-green-400" size={14} />;
        }
    };

    return (
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-[#334155] rounded-2xl p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="text-[#69F0AE]" size={18} />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Pulse of NeuraTrade</h3>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#69F0AE] animate-pulse" />
                    <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-tighter">Live Activity</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {activities.map((activity, idx) => (
                    <div
                        key={activity.id}
                        className="flex gap-3 group animate-in slide-in-from-right-4 duration-500"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <div className="mt-1">
                            <div className="w-8 h-8 rounded-lg bg-[#334155]/20 border border-[#334155] flex items-center justify-center group-hover:border-[#69F0AE]/30 group-hover:bg-[#69F0AE]/5 transition-all">
                                {getTypeIcon(activity.activityType)}
                            </div>
                        </div>
                        <div className="flex-1 border-b border-[#334155]/30 pb-3 group-last:border-0">
                            <p className="text-xs text-[#e2e8f0] font-medium leading-relaxed">
                                <span className="text-[#69F0AE] font-bold mr-1">{activity.userName}</span>
                                {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock size={10} className="text-[#64748b]" />
                                <span className="text-[10px] text-[#64748b] font-medium italic">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {activities.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-50 mt-12">
                        <Activity size={32} className="text-[#1e293b] mb-2" />
                        <p className="text-xs text-[#475569] italic">Waiting for community action...</p>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#334155]/30 text-center">
                <button className="text-[9px] font-bold text-[#94a3b8] hover:text-white uppercase tracking-[0.2em] transition-all">
                    View Complete Activity Journal
                </button>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>
        </div>
    );
};
