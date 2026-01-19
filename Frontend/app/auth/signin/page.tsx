'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Check for redirect - keep it for after verification
      const redirectPath = localStorage.getItem('redirectAfterLogin');

      // Check if admin login (has token and doesn't require verification)
      if (data.token && !data.requiresVerification) {
        // Admin login - skip 2FA
        login(data.token, data.user);
        // Remove redirect after using it for admin
        localStorage.removeItem('redirectAfterLogin');
        // Redirect admin to dashboard or saved redirect
        router.push(redirectPath || '/admin');
      } else if (data.requiresLeaderQuestions) {
        // Leader login - requires special verification questions
        localStorage.setItem('userEmailForVerification', email);
        localStorage.setItem('requiresLeaderQuestions', 'true');
        // Save redirect for after verification (don't remove redirectAfterLogin yet)
        if (redirectPath) {
          localStorage.setItem('redirectAfterVerification', redirectPath);
        }
        router.push('/auth/verify-code');
      } else {
        // Regular user (student) - requires 2FA verification
        localStorage.setItem('userEmailForVerification', email);
        localStorage.setItem('requiresLeaderQuestions', 'false');
        // Save redirect for after verification (don't remove redirectAfterLogin yet)
        if (redirectPath) {
          localStorage.setItem('redirectAfterVerification', redirectPath);
        }
        router.push('/auth/verify-code');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  // Check for redirect parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
      localStorage.setItem('redirectAfterLogin', redirect);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-green-700 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or <Link href="/auth/signup" className="font-medium text-[#005BBB] hover:text-[#007A3D]">create a new account</Link>
          </p>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FDB913] focus:border-[#FDB913] sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FDB913] focus:border-[#FDB913] sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#005BBB] focus:ring-[#FDB913] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>


          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#007A3D] hover:bg-[#005BBB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FDB913]"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}