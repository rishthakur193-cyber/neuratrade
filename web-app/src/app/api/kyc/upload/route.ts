// @ts-nocheck
import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { uploadFile } from '@/lib/storage';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');

        // Quick Bearer token check for security (in a real app, Middleware would handle this completely)
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized user' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const documentType = formData.get('documentType') as string || 'default';

        const documentsToLog = [];

        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json({ error: 'Payload Too Large: File exceeds 10MB limit' }, { status: 413 });
            }
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                return NextResponse.json({ error: 'Unsupported Media Type: Only PDF, JPG, PNG allowed' }, { status: 415 });
            }

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Route to GCS or local disk depending on environment
            const storedPath = await uploadFile({
                buffer,
                originalName: file.name,
                mimeType: file.type,
                folder: 'kyc',
                userId: user.id,
            });

            documentsToLog.push(storedPath);
        } else {
            documentsToLog.push(`mock_document_${documentType}`);
        }

        const result = await AuthService.updateKyc(token, documentsToLog);

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error('KYC Upload Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

