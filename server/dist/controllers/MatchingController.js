import { MatchingService } from '../services/MatchingService.js';
export const getMatches = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const matches = await MatchingService.getMatches(userId);
        res.status(200).json(matches);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
