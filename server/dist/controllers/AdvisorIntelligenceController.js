import { AdvisorDiscoveryService } from '../services/AdvisorDiscoveryService.js';
import { TrustScoreService } from '../services/TrustScoreService.js';
import { VerifiedPerformanceService } from '../services/VerifiedPerformanceService.js';
import { AdvisorStrategyService } from '../services/AdvisorStrategyService.js';
export const discoverAdvisors = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const results = await AdvisorDiscoveryService.discoverAdvisors(userId);
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getTrustScore = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: 'Missing advisor ID' });
        const score = await TrustScoreService.getTrustScore(id);
        res.status(200).json(score);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const computeTrustScore = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: 'Missing advisor ID' });
        const score = await TrustScoreService.computeAndSave(id);
        res.status(200).json(score);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getLeaderboard = async (req, res) => {
    try {
        const results = await VerifiedPerformanceService.getLeaderboard();
        res.status(200).json(results);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getStrategyDNA = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: 'Missing advisor ID' });
        const dna = await AdvisorStrategyService.getDNA(id);
        res.status(200).json(dna);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getVerifiedProfile = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: 'Missing advisor ID' });
        const profile = await VerifiedPerformanceService.getVerifiedProfile(id);
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
