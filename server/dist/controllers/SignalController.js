import { SignalService } from '../services/SignalService.js';
export const publishSignal = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        // Find advisor profile for user
        const advisor = await prisma.advisorProfile.findUnique({ where: { userId } });
        if (!advisor)
            return res.status(403).json({ message: 'Only advisors can publish signals' });
        const { symbol, entryPrice, stopLoss, target, riskLevel, tradeReason, isDirectSignal, disclaimerAccepted } = req.body;
        if (!symbol || !entryPrice || !stopLoss || !target) {
            return res.status(400).json({ message: 'Missing required signal fields' });
        }
        // --- Regulatory Compliance Check ---
        let finalIsDirectSignal = isDirectSignal === true;
        let finalDisclaimerAccepted = disclaimerAccepted === true;
        if (advisor.classification === 'COMMUNITY_STRATEGIST') {
            if (finalIsDirectSignal) {
                return res.status(403).json({ message: 'Community Strategists cannot publish direct buy/sell signals. Must publish as educational strategy.' });
            }
            if (!finalDisclaimerAccepted) {
                return res.status(400).json({ message: 'Community Strategists must accept the regulatory disclaimer before publishing.' });
            }
            // Force values for safety
            finalIsDirectSignal = false;
        }
        const ePrice = parseFloat(entryPrice);
        const sLoss = parseFloat(stopLoss);
        const tPrice = parseFloat(target);
        if (isNaN(ePrice) || isNaN(sLoss) || isNaN(tPrice)) {
            return res.status(400).json({ message: 'Prices must be valid numbers' });
        }
        // Basic Long Signal Logic
        if (tPrice <= ePrice) {
            return res.status(400).json({ message: 'Target must be greater than Entry Price for long signals' });
        }
        if (sLoss >= ePrice) {
            return res.status(400).json({ message: 'Stop Loss must be below Entry Price for long signals' });
        }
        const signal = await SignalService.publishSignal(advisor.id, {
            symbol,
            entryPrice: ePrice,
            stopLoss: sLoss,
            target: tPrice,
            riskLevel: riskLevel || 'MEDIUM',
            tradeReason,
            isDirectSignal: finalIsDirectSignal,
            disclaimerAccepted: finalDisclaimerAccepted
        });
        res.status(201).json(signal);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getActiveSignals = async (req, res) => {
    try {
        const signals = await SignalService.getActiveSignals();
        res.status(200).json(signals);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const closeSignal = async (req, res) => {
    try {
        const id = req.params.id;
        const { exitPrice } = req.body;
        if (!id || !exitPrice) {
            return res.status(400).json({ message: 'Missing signal ID or exit price' });
        }
        const signal = await SignalService.closeSignal(id, parseFloat(exitPrice));
        res.status(200).json(signal);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
import prisma from '../lib/prisma.js';
