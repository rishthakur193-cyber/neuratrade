const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class MatchingService {
  static async getMatches(token: string) {
    if (!token) throw new Error("Authentication token required");

    const response = await fetch(`${BASE_URL}/matching`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch matches');
    return result;
  }
}
