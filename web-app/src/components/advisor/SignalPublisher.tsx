'use client';

import React, { useState } from 'react';
import { SignalService } from '@/services/signal.service';
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

export const SignalPublisher = () => {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [error, setError] = useState<string>('');
    const [formData, setFormData] = useState({
        symbol: '',
        entryPrice: '',
        stopLoss: '',
        target: '',
        riskLevel: 'MEDIUM',
        tradeReason: '',
        isDirectSignal: false,
        disclaimerAccepted: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const storedUser = localStorage.getItem('ecosystem_user');
        if (!storedUser) {
            setError('Authentication token not found. Please log in again.');
            setStatus('ERROR');
            return;
        }
        const { token } = JSON.parse(storedUser);

        setStatus('LOADING');
        try {
            await SignalService.publishSignal(token, {
                symbol: formData.symbol,
                entryPrice: parseFloat(formData.entryPrice),
                stopLoss: parseFloat(formData.stopLoss),
                target: parseFloat(formData.target),
                riskLevel: formData.riskLevel,
                tradeReason: formData.tradeReason,
                isDirectSignal: formData.isDirectSignal,
                disclaimerAccepted: formData.disclaimerAccepted
            });
            setStatus('SUCCESS');
            setFormData({ symbol: '', entryPrice: '', stopLoss: '', target: '', riskLevel: 'MEDIUM', tradeReason: '', isDirectSignal: false, disclaimerAccepted: false });
            setTimeout(() => setStatus('IDLE'), 3000);
        } catch (err: any) {
            setError(err.message);
            setStatus('ERROR');
        }
    };

    return (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-[#69F0AE] w-6 h-6" />
                <h2 className="text-xl font-bold text-white">Publish Trade Signal</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-[#94a3b8] mb-1">Symbol</label>
                        <input
                            type="text"
                            placeholder="e.g. RELIANCE"
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#69F0AE]"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#94a3b8] mb-1">Risk Level</label>
                        <select
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#69F0AE]"
                            value={formData.riskLevel}
                            onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                        >
                            <option value="LOW">Low Risk</option>
                            <option value="MEDIUM">Medium Risk</option>
                            <option value="HIGH">High Risk</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-[#94a3b8] mb-1">Entry Price</label>
                        <input
                            type="number"
                            step="0.05"
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                            value={formData.entryPrice}
                            onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#94a3b8] mb-1">Stop Loss</label>
                        <input
                            type="number"
                            step="0.05"
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                            value={formData.stopLoss}
                            onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#94a3b8] mb-1">Target</label>
                        <input
                            type="number"
                            step="0.05"
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                            value={formData.target}
                            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-[#94a3b8] mb-1">Trade Reason</label>
                    <textarea
                        rows={3}
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-white"
                        placeholder="Explain why you are taking this trade..."
                        value={formData.tradeReason}
                        onChange={(e) => setFormData({ ...formData, tradeReason: e.target.value })}
                    ></textarea>
                </div>

                <div className="bg-[#0f172a] p-4 rounded-lg border border-[#334155] space-y-3">
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="isDirectSignal"
                            className="mt-1 w-4 h-4 rounded border-[#334155] text-[#69F0AE] focus:ring-[#69F0AE] bg-[#1e293b]"
                            checked={formData.isDirectSignal}
                            onChange={(e) => setFormData({ ...formData, isDirectSignal: e.target.checked })}
                        />
                        <label htmlFor="isDirectSignal" className="text-sm text-[#94a3b8]">
                            <span className="text-white font-bold block mb-1">Direct Execution Signal (SEBI Registered Only)</span>
                            Check this if you are a SEBI registered advisor providing a direct buy/sell recommendation. Community Strategists must leave this unchecked.
                        </label>
                    </div>
                </div>

                <div className="bg-[#3b2020] p-4 rounded-lg border border-[#ef4444]/30">
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="disclaimerAccepted"
                            required
                            className="mt-1 w-4 h-4 rounded border-[#334155] text-[#ef4444] focus:ring-[#ef4444] bg-[#1e293b]"
                            checked={formData.disclaimerAccepted}
                            onChange={(e) => setFormData({ ...formData, disclaimerAccepted: e.target.checked })}
                        />
                        <label htmlFor="disclaimerAccepted" className="text-sm text-[#fb7185]">
                            <span className="text-white font-bold block mb-1">Regulatory Compliance Disclaimer</span>
                            I acknowledge that I am publishing this strategy for educational purposes only. If I am not a SEBI registered investment advisor, I understand that providing direct financial advice without registration is against platform policy and SEBI regulations. I accept full responsibility for the content of this publication.
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === 'LOADING'}
                    className="w-full bg-[#69F0AE] hover:bg-[#2ecc71] text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {status === 'LOADING' ? 'Publishing...' : 'Broadcast Signal'}
                </button>

                {status === 'SUCCESS' && (
                    <div className="flex items-center gap-2 text-[#69F0AE] bg-[#69F0AE]/10 p-3 rounded-lg border border-[#69F0AE]/30">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-medium">Signal broadcasted successfully!</span>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="flex items-center gap-2 text-[#FF5252] bg-[#FF5252]/10 p-3 rounded-lg border border-[#FF5252]/30">
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}
            </form>
        </div>
    );
};
