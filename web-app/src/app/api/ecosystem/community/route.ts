// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { CommunityService } from '@/services/community.service';

export async function GET(req: NextRequest) {
    const tags = req.nextUrl.searchParams.get('tags')?.split(',');
    try {
        const posts = await CommunityService.getPosts(20, tags);
        return NextResponse.json({ posts, count: posts.length });
    } catch {
        return NextResponse.json({ posts: CommunityService.getMockPosts(), count: 5 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { authorId = 'mock-user', authorType = 'INVESTOR', authorName = 'Anonymous', content, tags = [], parentId } = await req.json();
        if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        const post = await CommunityService.createPost(authorId, authorType, authorName, content, tags, parentId);
        return NextResponse.json({ post }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}

