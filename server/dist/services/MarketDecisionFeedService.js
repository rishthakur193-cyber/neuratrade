import prisma from '../lib/prisma.js';
export class MarketDecisionFeedService {
    /**
     * Aggregates various streams into a unified chronological feed for the user.
     */
    static async getPersonalizedFeed(userId) {
        const feedItems = [];
        // 1. Fetch live signals from advisors this user might follow or see
        // For simplicity, we'll fetch all active signals
        const activeSignals = await prisma.advisorRecommendation.findMany({
            where: { isActiveSignal: true },
            include: {
                advisor: {
                    include: {
                        user: true,
                        verificationBadge: true,
                        trustScore: true
                    }
                }
            },
            take: 10,
            orderBy: { tradedAt: 'desc' }
        });
        // Get user's platform subscription tier
        const userSub = await prisma.platformSubscription.findUnique({
            where: { userId }
        });
        const userTier = userSub?.tier || 'Free';
        const hasPremiumAccess = userTier === 'Pro' || userTier === 'Institutional';
        for (const signal of activeSignals) {
            const isPremiumSignal = signal.advisor.classification === 'SEBI_REGISTERED' && signal.isDirectSignal;
            if (isPremiumSignal && !hasPremiumAccess) {
                feedItems.push({
                    id: `signal-${signal.id}`,
                    type: 'SIGNAL',
                    timestamp: signal.tradedAt.toISOString(),
                    content: `🔒 Premium Signal from ${signal.advisor.user.name}. Upgrade to PRO to view entry and targets.`,
                    confidenceScore: signal.advisor.trustScore ? signal.advisor.trustScore.overallScore / 10 : 85,
                    source: {
                        name: signal.advisor.user.name,
                        type: 'ADVISOR',
                        badge: 'SEBI_REGISTERED'
                    },
                    metadata: {
                        isLocked: true
                    }
                });
                continue;
            }
            feedItems.push({
                id: `signal-${signal.id}`,
                type: 'SIGNAL',
                timestamp: signal.tradedAt.toISOString(),
                content: `${signal.symbol} - ${signal.riskLevel} Risk: Target ₹${signal.target}`,
                confidenceScore: signal.advisor.trustScore ? signal.advisor.trustScore.overallScore / 10 : 85,
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
                    riskLevel: signal.riskLevel,
                    entryHit: signal.entryHit,
                    targetHit: signal.targetHit,
                    stopLossHit: signal.stopLossHit
                }
            });
        }
        // 2. Fetch recent community posts (top/trending)
        const recentPosts = await prisma.communityPost.findMany({
            where: { isScamFlagged: false },
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        for (const post of recentPosts) {
            feedItems.push({
                id: `post-${post.id}`,
                type: 'COMMUNITY_POST',
                timestamp: post.createdAt.toISOString(),
                content: post.content,
                source: {
                    name: post.authorName,
                    type: 'COMMUNITY'
                }
            });
        }
        // 3. Mocked AI Insights (since AI engine isn't fully integrated into DB yet)
        feedItems.push({
            id: `ai-insight-${Date.now()}-1`,
            type: 'AI_INSIGHT',
            timestamp: new Date().toISOString(),
            content: "Market volatility detected in Nifty IT index. Consider adjusting trailing stop-losses for existing tech positions.",
            confidenceScore: 92,
            source: {
                name: 'NeuraTrade Sentinel',
                type: 'AI_ENGINE'
            }
        });
        feedItems.push({
            id: `risk-alert-${Date.now()}-2`,
            type: 'RISK_ALERT',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            content: "Unusual options activity observed in HDFCBANK. High probability of gap up open tomorrow. Risk parameter adjusted.",
            confidenceScore: 88,
            source: {
                name: 'NeuraTrade Risk Engine',
                type: 'AI_ENGINE'
            }
        });
        // 4. Sort all items chronologically (newest first)
        feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return feedItems;
    }
}
