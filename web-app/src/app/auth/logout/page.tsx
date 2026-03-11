'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all auth tokens from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Clear any session cookies by calling the logout API if available
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    
    // Redirect to login
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Signing out...</p>
      </div>
    </div>
  );
}
