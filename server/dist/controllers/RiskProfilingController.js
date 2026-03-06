import { RiskProfilingService } from '../services/RiskProfilingService.js';
export const saveProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const profile = await RiskProfilingService.saveProfile({
            ...req.body,
            userId
        });
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const profile = await RiskProfilingService.getProfile(userId);
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
