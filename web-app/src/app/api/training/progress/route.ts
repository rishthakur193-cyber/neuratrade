import { NextResponse } from 'next/server';
import { TrainingService } from '@/services/training.service';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized middleware barrier' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user || user.role !== 'TRAINEE') {
            return NextResponse.json({ error: 'Trainee Privileges Required' }, { status: 403 });
        }

        const progress = await TrainingService.getProgress(user.id);
        return NextResponse.json({ progress }, { status: 200 });

    } catch (error: any) {
        console.error('Training Progress Fetch Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized middleware barrier' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user || user.role !== 'TRAINEE') {
            return NextResponse.json({ error: 'Trainee Privileges Required' }, { status: 403 });
        }

        const body = await req.json();
        const { courseId, progress } = body;

        const result = await TrainingService.updateProgress(user.id, courseId, progress);
        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
