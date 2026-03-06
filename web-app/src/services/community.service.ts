const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface CommunityPost {
    id: string;
    authorId: string;
    authorType: 'INVESTOR' | 'ADVISOR';
    authorName: string;
    content: string;
    tags: string[];
    likes: number;
    parentId: string | null;
    isScamFlagged: boolean;
    aiRiskScore: number;
    riskLabel: 'SAFE' | 'CAUTION' | 'HIGH_RISK';
    createdAt: string;
    replies?: CommunityPost[];
}

export class CommunityService {
    static async getPosts(limit = 20): Promise<CommunityPost[]> {
        const res = await fetch(`${API_URL}/ecosystem/community?limit=${limit}`);
        if (!res.ok) throw new Error('Failed to fetch community posts');
        return await res.json();
    }

    static async createPost(token: string, data: { content: string, tags: string[], parentId?: string, authorType?: string, authorName?: string }): Promise<CommunityPost> {
        const res = await fetch(`${API_URL}/ecosystem/community`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create post');
        return await res.json();
    }
}
