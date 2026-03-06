import { AuditService } from './audit.service';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class AuthService {
    static async register(data: any) {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Registration failed');
        return result;
    }

    static async login(data: any, context: any = {}) {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Login failed');

        // Handle 2FA redirect if needed
        if (result.requires2FA) return result;

        return result;
    }

    static async me(token: string) {
        const response = await fetch(`${BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch user profile');
        return result;
    }

    static async setup2FA(token: string) {
        const response = await fetch(`${BASE_URL}/auth/2fa/setup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || '2FA setup failed');
        return result;
    }

    static async verifyAndEnable2FA(token: string, code: string) {
        const response = await fetch(`${BASE_URL}/auth/2fa/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || '2FA verification failed');
        return result;
    }
}
