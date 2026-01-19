'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for token in localStorage on initial load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        // Check if token is expired
        if (isTokenExpired(token)) {
          console.log('Token expired, clearing auth state');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        } else {
          // Token is valid, restore auth state
          const parsedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(parsedUser);
          console.log('Auth restored from localStorage:', parsedUser.email);
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        // If old/invalid data is stored, clear it out gracefully
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    
    setLoading(false); // Done checking authentication
  }, []);

  useEffect(() => {
    // Redirect logic - only run if pathname is available and not loading
    if (!pathname || loading) return;
    
    const publicPaths = ['/', '/auth/signin', '/auth/signup', '/auth/verify-code', '/landing', '/home', '/about', '/contact', '/student', '/survey']; 
    const isPublicPath = publicPaths.includes(pathname);

    if (!isAuthenticated && !isPublicPath) {
      console.log('Redirecting to landing - not authenticated');
      router.push('/landing');
    }
  }, [isAuthenticated, pathname, router, loading]);

  const login = (token: string, userData: any) => {
    // Persist auth state
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    console.log('User logged in:', userData.email);
    // Do not navigate here; let the calling page decide where to redirect
  };

  const logout = () => {
    console.log('User logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/landing');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}