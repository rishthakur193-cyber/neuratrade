import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';

const SCAM_KEYWORDS = [
    'guaranteed profit', 'guaranteed returns', '100% profit', 'no risk',
    'insider tip', 'pump', 'dump', 'buy now before', 'limited slots',
    'WhatsApp group', 'Telegram signal', 'sure shot', 'multibagger tip',
];

const CAUTION_KEYWORDS = [
    'hot tip', 'buy fast', 'quick profit', 'double your money', 'trust me',
    'call me', 'DM me', 'secret strategy',
];

export class CommunityService {
    static async getPosts(limit = 20) {
        const posts = await prisma.communityPost.findMany({
            where: { parentId: null },
            include: {
                replies: { take: 5 }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return posts.map(p => ({
            ...p,
            tags: JSON.parse(p.tags || '[]'),
            riskLabel: p.aiRiskScore >= 50 ? 'HIGH_RISK' : p.aiRiskScore >= 20 ? 'CAUTION' : 'SAFE'
        }));
    }

    static async createPost(data: { authorId: string, authorType: string, authorName: string, content: string, tags: string[], parentId?: string }) {
        const { score } = this.scoreContent(data.content);

        return await prisma.communityPost.create({
            data: {
                id: randomUUID(),
                authorId: data.authorId,
                authorType: data.authorType,
                authorName: data.authorName,
                content: data.content,
                tags: JSON.stringify(data.tags),
                parentId: data.parentId || null,
                aiRiskScore: score,
                isScamFlagged: score >= 75
            }
        });
    }

    private static scoreContent(content: string) {
        const lc = content.toLowerCase();
        let score = 0;
        for (const kw of SCAM_KEYWORDS) if (lc.includes(kw)) score += 25;
        for (const kw of CAUTION_KEYWORDS) if (lc.includes(kw)) score += 12;
        score = Math.min(100, score);
        return { score };
    }
}
