import { SubscriptionService } from '../services/SubscriptionService.js';
export const createSubscription = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const result = await SubscriptionService.createSubscription({
            ...req.body,
            investorId: userId
        });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getSubscriptions = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const subscriptions = await SubscriptionService.getInvestorSubscriptions(userId);
        res.status(200).json(subscriptions);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const checkSubscription = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { advisorId } = req.params;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const isSubscribed = await SubscriptionService.isSubscribed(userId, advisorId);
        res.status(200).json({ isSubscribed });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
