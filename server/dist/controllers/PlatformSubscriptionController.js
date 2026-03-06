import { PlatformSubscriptionService } from '../services/PlatformSubscriptionService.js';
export const upgradePlatformPlan = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const { plan, amount, method } = req.body;
        const result = await PlatformSubscriptionService.upgradePlan(userId, plan, amount, method);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getPlatformSubscription = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const sub = await PlatformSubscriptionService.getSubscription(userId);
        res.status(200).json(sub || { tier: 'Free', status: 'INACTIVE' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
