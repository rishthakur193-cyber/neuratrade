import prisma from '../lib/prisma.js';
import { getBroadcastToAll } from '../websocket.js';
import { TrustScoreService } from './TrustScoreService.js';
import { randomUUID } from 'crypto';
export class SignalService {
    static activeSignalsCache = null;
    static lastCacheUpdate = 0;
    static CACHE_TTL = 30000; // 30 seconds
    static async publishSignal(advisorId, data) {
        const signal = await prisma.advisorRecommendation.create({
            data: {
                id: randomUUID(),
                advisorId,
                symbol: data.symbol,
                entryPrice: data.entryPrice,
                stopLoss: data.stopLoss,
                target: data.target,
                riskLevel: data.riskLevel,
                tradeReason: data.tradeReason,
                isDirectSignal: data.isDirectSignal,
                disclaimerAccepted: data.disclaimerAccepted,
                isActiveSignal: true,
                tradedAt: new Date()
            },
            include: {
                advisor: {
                    include: { user: { select: { name: true } } }
                }
            }
        });
        // Broadcast to all connected clients
        const broadcast = getBroadcastToAll();
        if (broadcast) {
            broadcast({
                type: 'NEW_SIGNAL',
                signal: {
                    id: signal.id,
                    advisorName: signal.advisor.user.name,
                    classification: signal.advisor.classification,
                    symbol: signal.symbol,
                    entryPrice: signal.entryPrice,
                    stopLoss: signal.stopLoss,
                    target: signal.target,
                    riskLevel: signal.riskLevel,
                    tradeReason: signal.tradeReason,
                    isDirectSignal: signal.isDirectSignal,
                    timestamp: signal.tradedAt
                }
            });
            broadcast({
                type: 'FEED_EVENT',
                feedItem: {
                    id: `signal-${signal.id}`,
                    type: 'SIGNAL',
                    timestamp: signal.tradedAt.toISOString(),
                    content: `${signal.symbol} - ${signal.riskLevel} Risk: Target ₹${signal.target}`,
                    confidenceScore: 85, // Defaulting if not fetched
                    source: {
                        name: signal.advisor.user.name,
                        type: 'ADVISOR',
                        badge: signal.advisor.classification === 'SEBI_REGISTERED' ? 'SEBI_REGISTERED' : 'COMMUNITY_STRATEGIST'
                    },
                    metadata: {
                        symbol: signal.symbol,
                        entryPrice: signal.entryPrice,
                        target: signal.target,
                        stopLoss: signal.stopLoss,
                        riskLevel: signal.riskLevel
                    }
                }
            });
        }
        // Invalidate cache
        this.activeSignalsCache = null;
        // Automated Broker Execution for Direct Signals
        if (data.isDirectSignal) {
            try {
                const brokerLink = await prisma.advisorBrokerLink.findUnique({
                    where: { advisorId }
                });
                if (brokerLink && brokerLink.isActive) {
                    const { BrokerService } = await import('./BrokerService.js');
                    const executionResult = await BrokerService.executeSignal(brokerLink.brokerName, signal);
                    console.log(`[SignalService] Broker execution triggered for ${signal.symbol} via ${brokerLink.brokerName}:`, executionResult);
                }
                else {
                    console.log(`[SignalService] No active broker link for advisor ${advisorId}. Skipping automated execution.`);
                }
            }
            catch (err) {
                console.error(`[SignalService] Broker execution failed for ${signal.symbol}:`, err);
            }
        }
        return signal;
    }
    static async getActiveSignals() {
        const now = Date.now();
        if (this.activeSignalsCache && (now - this.lastCacheUpdate < this.CACHE_TTL)) {
            return this.activeSignalsCache;
        }
        const signals = await prisma.advisorRecommendation.findMany({
            where: { isActiveSignal: true },
            include: {
                advisor: {
                    include: { user: { select: { name: true } } }
                }
            },
            orderBy: { tradedAt: 'desc' }
        });
        const formattedSignals = signals.map((s) => ({
            id: s.id,
            advisorName: s.advisor.user.name,
            classification: s.advisor.classification,
            symbol: s.symbol,
            entryPrice: s.entryPrice,
            stopLoss: s.stopLoss,
            target: s.target,
            riskLevel: s.riskLevel,
            tradeReason: s.tradeReason,
            isDirectSignal: s.isDirectSignal,
            timestamp: s.tradedAt
        }));
        this.activeSignalsCache = formattedSignals;
        this.lastCacheUpdate = now;
        return formattedSignals;
    }
    static async closeSignal(signalId, exitPrice) {
        const signal = await prisma.advisorRecommendation.findUnique({
            where: { id: signalId }
        });
        if (!signal)
            throw new Error('Signal not found');
        const returnPct = ((exitPrice - signal.entryPrice) / signal.entryPrice) * 100;
        const result = returnPct > 0 ? 'WIN' : (returnPct < 0 ? 'LOSS' : 'BREAKEVEN');
        const updatedSignal = await prisma.advisorRecommendation.update({
            where: { id: signalId },
            data: {
                exitPrice,
                returnPct,
                result,
                isActiveSignal: false,
                closedAt: new Date()
            }
        });
        // Trigger trust score recalculation
        try {
            await TrustScoreService.computeAndSave(signal.advisorId);
        }
        catch (err) {
            console.error('Failed to update trust score after signal closure:', err);
        }
        // Trigger performance analytics recalculation
        try {
            const { PerformanceAnalyticsService } = await import('./PerformanceAnalyticsService.js');
            await PerformanceAnalyticsService.recalculateAndStore(signal.advisorId);
        }
        catch (err) {
            console.error('Failed to update performance stats after signal closure:', err);
        }
        // Invalidate cache
        this.activeSignalsCache = null;
        const broadcast = getBroadcastToAll();
        if (broadcast) {
            broadcast({
                type: 'SIGNAL_CLOSED',
                signalId,
                result,
                returnPct
            });
        }
        return updatedSignal;
    }
}
