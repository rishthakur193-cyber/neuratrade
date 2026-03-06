'use client';

import React, { useEffect, useState } from 'react';
import { Signal, SignalService } from '@/services/signal.service';
import { Bell, Shield, TrendingUp, User } from 'lucide-react';

export const LiveSignalFeed = () => {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [newSignalAnim, setNewSignalAnim] = useState<string | null>(null);

    useEffect(() => {
        // Initial fetch
        SignalService.getActiveSignals().then(setSignals);

        // Setup WebSocket listener
        const apiHost = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace('http', 'ws').replace('/api', '')
            : 'ws://localhost:5000';

        const socket = new WebSocket(apiHost);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_SIGNAL') {
                const signal = data.signal;
                setSignals(prev => [signal, ...prev]);
                setNewSignalAnim(signal.id);
                setTimeout(() => setNewSignalAnim(null), 5000);
            } else if (data.type === 'SIGNAL_CLOSED') {
                setSignals(prev => prev.filter(s => s.id !== data.signalId));
            } else if (data.type === 'TRACKING_UPDATE') {
                setSignals(prev => prev.map(s => {
                    if (s.id === data.signalId) {
                        return {
                            ...s,
                            entryHit: data.entryHit,
                            targetHit: data.targetHit,
                            stopLossHit: data.stopLossHit
                        };
                    }
                    return s;
                }));
            }
        };

        return () => socket.close();
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Bell className="text-[#69F0AE] animate-pulse" size={20} />
                    <h3 className="text-lg font-bold text-white">Live Trade Signals</h3>
                </div>
                <span className="text-xs text-[#94a3b8] bg-[#334155] px-2 py-1 rounded-full border border-[#475569]">
                    REAL-TIME ACTIVE
                </span>
            </div>

            {signals.length === 0 ? (
                <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-12 text-center">
                    <TrendingUp className="mx-auto w-12 h-12 text-[#334155] mb-4" />
                    <p className="text-[#94a3b8] text-sm italic">No active signals at the moment. Waiting for analysts...</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {signals.map((signal) => (
                        <div
                            key={signal.id}
                            className={`bg-[#0f172a] border border-[#334155] rounded-xl p-5 shadow-lg relative overflow-hidden transition-all duration-500 ${newSignalAnim === signal.id ? 'border-[#69F0AE] scale-[1.02] shadow-[#69F0AE]/20' : ''
                                }`}
                        >
                            {newSignalAnim === signal.id && (
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#69F0AE] animate-shimmer" />
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#334155] flex items-center justify-center border border-[#475569]">
                                        <User size={18} className="text-[#94a3b8]" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold leading-none mb-1">{signal.advisorName}</h4>
                                        <div className="flex items-center gap-1 mt-1">
                                            {signal.classification === 'SEBI_REGISTERED' ? (
                                                <div className="flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                                                    <Shield size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">SEBI Registered</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                                                    <User size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Community Strategist</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold ${signal.riskLevel === 'HIGH' ? 'bg-[#FF5252]/10 text-[#FF5252] border border-[#FF5252]/30' :
                                    signal.riskLevel === 'MEDIUM' ? 'bg-[#FF9800]/10 text-[#FF9800] border border-[#FF9800]/30' :
                                        'bg-[#69F0AE]/10 text-[#69F0AE] border border-[#69F0AE]/30'
                                    }`}>
                                    {signal.riskLevel} RISK
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-[#1e293b] rounded-lg p-3 border border-[#334155]">
                                <div className="text-center">
                                    <p className="text-[10px] text-[#94a3b8] uppercase mb-1">Symbol</p>
                                    <p className="text-sm font-bold text-white">{signal.symbol}</p>
                                </div>
                                <div className="text-center relative">
                                    <p className="text-[10px] text-[#94a3b8] uppercase mb-1">Entry</p>
                                    <p className="text-sm font-bold text-[#69F0AE]">₹{signal.entryPrice}</p>
                                    {signal.entryHit && !signal.targetHit && (
                                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] bg-[#69F0AE]/20 text-[#69F0AE] px-1 rounded whitespace-nowrap">
                                            HIT
                                        </span>
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-[#94a3b8] uppercase mb-1">SL</p>
                                    <p className="text-sm font-bold text-[#FF5252]">₹{signal.stopLoss}</p>
                                </div>
                                <div className="text-center relative">
                                    <p className="text-[10px] text-[#94a3b8] uppercase mb-1">Target</p>
                                    <p className="text-sm font-bold text-[#69F0AE]">₹{signal.target}</p>
                                    {signal.targetHit && (
                                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] bg-[#69F0AE]/20 text-[#69F0AE] px-1 rounded whitespace-nowrap">
                                            HIT
                                        </span>
                                    )}
                                </div>
                            </div>

                            {signal.tradeReason && (
                                <div className="mt-4 pt-4 border-t border-[#334155]/50">
                                    <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                                        <span className="text-[#69F0AE] font-bold mr-1">Rationale:</span>
                                        {signal.tradeReason}
                                    </p>
                                </div>
                            )}

                            {signal.classification === 'COMMUNITY_STRATEGIST' && (
                                <div className="mt-3 pt-3 border-t border-[#334155]/50">
                                    <p className="text-[10px] text-[#94a3b8] italic">
                                        Disclaimer: This is an educational strategy published by a community strategist, not direct financial advice from a SEBI registered investment advisor.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
