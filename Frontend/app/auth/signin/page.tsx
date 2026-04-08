'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import AuthBackground from '../../components/AuthBackground';

export default function SignInPage() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
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
        localStorage.removeItem('userEmailForVerification');
        localStorage.removeItem('requiresLeaderQuestions');
        localStorage.removeItem('redirectAfterVerification');
        login(data.token, data.user);
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath || '/admin');
      } else if (data.verificationType === 'leader_questions') {
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
    <AuthBackground>
      {/* Header Logo */}
      <header className="relative z-20 px-6 sm:px-12 py-6">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="RSBS Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-2xl font-black text-white tracking-tight group-hover:text-purple-400 transition-colors">
            RSBS
          </h1>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex flex-1 flex-col justify-center items-center px-4 pb-20">
        <div className="w-full max-w-[450px] bg-black/80 backdrop-blur-md rounded-2xl p-10 md:p-16 border border-white/10 shadow-2xl">
          <h2 className="text-white text-3xl font-bold mb-7">Sign In</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                id="email"
                type="text"
                className="w-full bg-[#333] hover:bg-[#444] transition-colors rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label
                htmlFor="email"
                className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
              >
                Email or phone number
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                type="password"
                className="w-full bg-[#333] hover:bg-[#444] transition-colors rounded-lg px-5 pt-6 pb-2 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500 peer h-14"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label
                htmlFor="password"
                className="absolute left-5 top-4 text-[#8c8c8c] text-sm transition-all peer-focus:text-[11px] peer-focus:top-2 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#8c8c8c] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none"
              >
                Password
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all text-white font-bold py-3.5 rounded-lg mt-6 shadow-lg shadow-purple-500/20 active:scale-95"
            >
              Sign In
            </button>

            <div className="flex items-center justify-between mt-2 text-[#b3b3b3] text-sm font-medium">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded bg-[#737373] border-none focus:ring-0 focus:ring-offset-0 checked:bg-purple-600 cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 cursor-pointer hover:text-white transition-colors">
                  Remember me
                </label>
              </div>
              <Link href="#" className="hover:underline hover:text-white transition-colors">
                Need help?
              </Link>
            </div>
          </form>

          <div className="mt-16 text-[#737373] text-[16px]">
            New to RSBS?{' '}
            <Link href="/auth/signup" className="text-white hover:underline font-medium decoration-purple-500 underline-offset-4">
              Sign up now.
            </Link>
          </div>

          <div className="mt-3 text-[13px] text-[#8c8c8c]">
            <button className="text-purple-400 hover:underline">Learn more.</button>
          </div>
        </div>
      </main>
    </AuthBackground>
  );
}
