import { MarketDecisionFeedService } from '../services/MarketDecisionFeedService.js';
export class FeedController {
    static async getDynamicFeed(req, res) {
        try {
            // userId would normally come from req.user
            const userId = req.user?.id || 'anonymous';
            const feedItems = await MarketDecisionFeedService.getPersonalizedFeed(userId);
            res.status(200).json(feedItems);
        }
        catch (error) {
            console.error('[FeedController] Error fetching dynamic feed:', error);
            res.status(500).json({ status: 'error', message: 'Failed to fetch dynamic feed' });
        }
    }
}
