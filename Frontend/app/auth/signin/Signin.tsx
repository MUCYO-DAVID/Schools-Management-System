'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import AuthShell from '../components/AuthShell';
import { BACKEND_URL } from '@/lib/backend';

export default function SignInPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setLoadingHint(t("auth.signin.checkingCredentials"));
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
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
        // Regular user (student) — redirect quickly; OTP email sends in background
        setLoadingHint(t("auth.signin.redirectingToVerification"));
        localStorage.setItem('userEmailForVerification', email);
        localStorage.setItem('requiresLeaderQuestions', 'false');
        // Save redirect for after verification (don't remove redirectAfterLogin yet)
        if (redirectPath) {
          localStorage.setItem('redirectAfterVerification', redirectPath);
        }
        router.push('/auth/verify-code');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setError(t("auth.signin.signInTimedOut"));
      } else {
        setError(err.message || t("auth.signin.unexpectedError"));
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
      setLoadingHint(t("auth.signin.signingIn"));
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
    <AuthShell
      title={t("auth.signin.title")}
      subtitle={
        <>
          {t("auth.signin.subtitleNewHere")}{' '}
          <Link href="/auth/signup" className="font-semibold text-white hover:underline underline-offset-4">
            {t("auth.signin.createAccountLink")}
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/15 p-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            {t("auth.signin.emailLabel")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-white/80">
            {t("auth.signin.passwordLabel")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] ${
            isLoading ? 'cursor-not-allowed opacity-70' : ''
          }`}
        >
          {isLoading ? loadingHint : t("auth.signin.submit")}
        </button>
      </form>
    </AuthShell>
  );
}
