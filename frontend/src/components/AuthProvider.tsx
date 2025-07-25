'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authAPI } from '@/lib/api';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, setUser, setToken, logout, setLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Check if we have a token in localStorage
      if (token) {
        try {
          // Verify token by fetching user data
          const response = await authAPI.getMe();
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          logout();
        }
      }
      
      setLoading(false);
      setIsInitialized(true);
    };

    initializeAuth();
  }, [token, setUser, logout, setLoading]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
