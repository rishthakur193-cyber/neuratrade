'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Shield, ShieldAlert, Cpu, MessagesSquare, Activity } from 'lucide-react';
import { GlassCard } from '../ui/PremiumUI';

export interface FeedItem {
    id: string;
    type: 'SIGNAL' | 'AI_INSIGHT' | 'RISK_ALERT' | 'STRATEGY_UPDATE' | 'COMMUNITY_POST';
    timestamp: string;
    content: string;
    metadata?: any;
    source: {
        name: string;
        type: 'ADVISOR' | 'AI_ENGINE' | 'COMMUNITY';
        badge?: string;
    };
    confidenceScore?: number;
}

export const MarketDecisionFeed = () => {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'SIGNALS' | 'AI_INSIGHTS' | 'COMMUNITY'>('ALL');
    const [newItemAnim, setNewItemAnim] = useState<string | null>(null);

    useEffect(() => {
        // Fetch historical personalized feed
        const fetchFeed = async () => {
            try {
                const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const token = localStorage.getItem('token') || '';
                const res = await fetch(`${apiHost}/feed/dynamic`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFeedItems(data);
                }
            } catch (err) {
                console.error('Failed to load decision feed', err);
            }
        };
        fetchFeed();

        // Setup WebSocket listener for dynamic feed events
        const wsHost = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace('http', 'ws').replace('/api', '')
            : 'ws://localhost:5000';

        const socket = new WebSocket(wsHost);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'FEED_EVENT') {
                const item: FeedItem = data.feedItem;
                setFeedItems(prev => [item, ...prev]);
                setNewItemAnim(item.id);
                setTimeout(() => setNewItemAnim(null), 5000);
            } else if (data.type === 'TRACKING_UPDATE') {
                // Forward the tracking update to the feed if it's a signal
                setFeedItems(prev => prev.map(item => {
                    if (item.id === `signal-${data.signalId}`) {
                        return {
                            ...item,
                            metadata: {
                                ...item.metadata,
                                entryHit: data.entryHit,
                                targetHit: data.targetHit,
                                stopLossHit: data.stopLossHit
                            }
                        };
                    }
                    return item;
                }));
            }
        };

        return () => socket.close();
    }, []);

    const filteredFeed = feedItems.filter(item => {
        if (filter === 'ALL') return true;
        if (filter === 'SIGNALS' && item.type === 'SIGNAL') return true;
        if (filter === 'AI_INSIGHTS' && (item.type === 'AI_INSIGHT' || item.type === 'RISK_ALERT')) return true;
        if (filter === 'COMMUNITY' && item.type === 'COMMUNITY_POST') return true;
        return false;
    });

    const getIconForType = (type: string) => {
        switch (type) {
            case 'SIGNAL': return <Activity size={16} className="text-[#69F0AE]" />;
            case 'AI_INSIGHT': return <Cpu size={16} className="text-[#A259FE]" />;
            case 'RISK_ALERT': return <ShieldAlert size={16} className="text-[#FF5252]" />;
            case 'COMMUNITY_POST': return <MessagesSquare size={16} className="text-[#4FC3F7]" />;
            default: return <Bell size={16} className="text-white" />;
        }
    };

    const getBorderForType = (type: string) => {
        switch (type) {
            case 'SIGNAL': return 'border-l-4 border-l-[#69F0AE]';
            case 'AI_INSIGHT': return 'border-l-4 border-l-[#A259FE]';
            case 'RISK_ALERT': return 'border-l-4 border-l-[#FF5252]';
            case 'COMMUNITY_POST': return 'border-l-4 border-l-[#4FC3F7]';
            default: return 'border-l-4 border-l-white';
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0f1c] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-[#0f172a] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-premium-gradient p-[1px]">
                        <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                            <Activity size={20} className="text-white relative z-10" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-white uppercase">Market Decision Feed</h2>
                        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Live Synthesis Dashboard</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {['ALL', 'SIGNALS', 'AI_INSIGHTS', 'COMMUNITY'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${filter === f
                                    ? 'bg-white/10 border-white/20 text-white'
                                    : 'bg-transparent border-transparent text-text-muted hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline Feed Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative custom-scrollbar">
                {/* Vertical Timeline Guide */}
                <div className="absolute top-0 bottom-0 left-[2rem] w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent z-0 hidden lg:block" />

                {filteredFeed.map((item) => (
                    <div
                        key={item.id}
                        className={`relative z-10 flex gap-6 w-full ${newItemAnim === item.id ? 'animate-shimmer' : ''}`}
                    >
                        {/* Timeline Note */}
                        <div className="hidden lg:flex flex-col items-center mt-2 w-4">
                            <div className="w-3 h-3 rounded-full bg-[#1e293b] border-2 border-[#334155] z-10" />
                        </div>

                        {/* Card Content */}
                        <GlassCard className={`flex-1 p-5 border-white/5 relative ${getBorderForType(item.type)}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                        {getIconForType(item.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-bold text-white">{item.source.name}</h4>
                                            {item.source.badge === 'SEBI_REGISTERED' && (
                                                <span className="text-[8px] px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20 flex items-center gap-1 font-bold uppercase tracking-wider">
                                                    <Shield size={8} /> SEBI
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-text-muted">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {item.confidenceScore && (
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">AI Conf</span>
                                            <span className="text-sm font-black text-white">{item.confidenceScore}%</span>
                                        </div>
                                        <div className="w-16 h-1 mt-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-premium-gradient" style={{ width: `${item.confidenceScore}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-text-secondary leading-relaxed font-medium">
                                {item.content}
                            </p>

                            {/* Additional display for Signal Metadata */}
                            {item.type === 'SIGNAL' && item.metadata && (
                                <div className="mt-4 flex gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-text-muted uppercase tracking-widest mb-1">Entry</span>
                                        <span className="text-xs font-black text-[#69F0AE] relative">
                                            ₹{item.metadata.entryPrice}
                                            {item.metadata.entryHit && !item.metadata.targetHit && (
                                                <span className="absolute -top-3 -right-6 text-[7px] bg-[#69F0AE]/20 text-[#69F0AE] px-1 rounded">HIT</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-text-muted uppercase tracking-widest mb-1">Target</span>
                                        <span className="text-xs font-black text-[#69F0AE] relative">
                                            ₹{item.metadata.target}
                                            {item.metadata.targetHit && (
                                                <span className="absolute -top-3 -right-6 text-[7px] bg-[#69F0AE]/20 text-[#69F0AE] px-1 rounded">HIT</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-text-muted uppercase tracking-widest mb-1">Stop Loss</span>
                                        <span className="text-xs font-black text-[#FF5252] relative">
                                            ₹{item.metadata.stopLoss}
                                            {item.metadata.stopLossHit && (
                                                <span className="absolute -top-3 -right-6 text-[7px] bg-[#FF5252]/20 text-[#FF5252] px-1 rounded">HIT</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}

                        </GlassCard>
                    </div>
                ))}

                {filteredFeed.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                        <Activity size={32} className="text-white/10 mb-4" />
                        <p className="text-sm font-bold text-text-muted">No insights available for this view.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
