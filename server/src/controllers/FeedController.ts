import type { Request, Response } from 'express';
import { MarketDecisionFeedService } from '../services/MarketDecisionFeedService.js';

export class FeedController {
    static async getDynamicFeed(req: Request, res: Response) {
        try {
            // userId would normally come from req.user
            const userId = (req as any).user?.id || 'anonymous';

            const feedItems = await MarketDecisionFeedService.getPersonalizedFeed(userId);

            res.status(200).json(feedItems);
        } catch (error: any) {
            console.error('[FeedController] Error fetching dynamic feed:', error);
            res.status(500).json({ status: 'error', message: 'Failed to fetch dynamic feed' });
        }
    }
}
