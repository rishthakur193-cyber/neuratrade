import prisma from '../lib/prisma.js';
import { SignalService } from './SignalService.js';
import { getBroadcastToAll } from '../websocket.js';

export class TradeVerificationEngine {
    private isRunning = false;
    private intervalId: NodeJS.Timeout | null = null;
    private CHECK_INTERVAL_MS = 60000; // 1 minute

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.intervalId = setInterval(() => this.checkActiveSignals(), this.CHECK_INTERVAL_MS);
        console.log('[TradeVerificationEngine] Started background verification service.');
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('[TradeVerificationEngine] Stopped verification service.');
    }

    private async checkActiveSignals() {
        const activeRecommendations = await prisma.advisorRecommendation.findMany({
            where: { isActiveSignal: true }
        });

        if (activeRecommendations.length === 0) return;

        console.log(`[TradeVerificationEngine] Scanning ${activeRecommendations.length} active signals...`);

        // In a real system, we would fetch live market data from the BrokerService here.
        // For demonstration, we will simulate realistic market movement.

        for (const recommendation of activeRecommendations) {
            // Simulated Market Check
            const currentPrice = this.simulateMarketPrice(recommendation.entryPrice);
            await this.evaluateSignal(recommendation, currentPrice);
        }
    }

    private simulateMarketPrice(entry: number): number {
        // Randomly drift price +/- 3% from entry
        const drift = entry * (Math.random() * 0.06 - 0.03);
        return entry + drift;
    }

    private async evaluateSignal(signal: any, currentPrice: number) {
        let updateData: any = {};
        const now = new Date();

        // 1. Check Entry
        if (!signal.entryHit) {
            // For a long trade, assume entry is hit if current price crosses it
            // Simplified logic: Assume entry is always hit eventually for demo
            if (Math.abs(currentPrice - signal.entryPrice) / signal.entryPrice < 0.02) {
                updateData.entryHit = true;
                updateData.entryHitAt = now;
            }
        }

        // 2. Check Exits if Entry is Hit
        if (signal.entryHit || updateData.entryHit) {
            let shouldClose = false;
            let exitPrice = 0;

            // Target condition (Long)
            if (currentPrice >= signal.target) {
                updateData.targetHit = true;
                updateData.targetHitAt = now;
                exitPrice = signal.target;
                shouldClose = true;
            }
            // Stop Loss condition (Long)
            else if (currentPrice <= signal.stopLoss) {
                updateData.stopLossHit = true;
                updateData.stopLossHitAt = now;
                exitPrice = signal.stopLoss;
                shouldClose = true;
            }

            // If we need to close the signal
            if (shouldClose) {
                // Determine Risk Reward Ratio
                const rr = (signal.target - signal.entryPrice) / (signal.entryPrice - signal.stopLoss);
                updateData.riskRewardRatio = Math.abs(rr);

                // Determine time to exit in minutes
                const entryTime = updateData.entryHitAt || signal.entryHitAt || signal.tradedAt;
                const timeDiffMs = now.getTime() - entryTime.getTime();
                updateData.timeToExitMin = Math.round(timeDiffMs / 60000);

                // We delegate actual closure to SignalService so it can handle Trust Score hooks etc.
                // First update the tracking fields
                await prisma.advisorRecommendation.update({
                    where: { id: signal.id },
                    data: updateData
                });

                console.log(`[TradeVerificationEngine] Auto-closing signal ${signal.symbol} at ${exitPrice}`);
                await SignalService.closeSignal(signal.id, exitPrice);

                // Broadcast tracking update
                const broadcast = getBroadcastToAll();
                if (broadcast) {
                    broadcast({
                        type: 'TRACKING_UPDATE',
                        signalId: signal.id,
                        entryHit: updateData.entryHit || signal.entryHit,
                        targetHit: updateData.targetHit,
                        stopLossHit: updateData.stopLossHit
                    });
                }
                return; // Handled
            }
        }

        // Apply intermediate tracking updates if any (e.g. entry was just hit)
        if (Object.keys(updateData).length > 0) {
            await prisma.advisorRecommendation.update({
                where: { id: signal.id },
                data: updateData
            });

            // Broadcast entry hit
            if (updateData.entryHit) {
                const broadcast = getBroadcastToAll();
                if (broadcast) {
                    broadcast({
                        type: 'TRACKING_UPDATE',
                        signalId: signal.id,
                        entryHit: true,
                        targetHit: false,
                        stopLossHit: false
                    });
                }
            }
        }
    }
}

export const verificationEngine = new TradeVerificationEngine();
