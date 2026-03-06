const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class TrainingService {
    static async getProgress(token: string) {
        if (!token) throw new Error("Authentication token required");

        const response = await fetch(`${BASE_URL}/training/progress`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch training progress');
        return result;
    }

    static async updateProgress(token: string, courseId: string, increment: number) {
        if (!token) throw new Error("Authentication token required");

        const response = await fetch(`${BASE_URL}/training/progress`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseId, increment }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update progress');
        return result;
    }
}
