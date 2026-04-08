'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LayoutDashboard, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import UserProfile from '../components/UserProfile';
import Navigation from '../components/Navigation';

export default function ProfilePage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  const workspacePath =
    user?.role === 'parent'
      ? '/parent'
      : user?.role === 'teacher' || user?.role === 'leader' || user?.role === 'admin'
        ? '/teacher'
        : '/student';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, loading, router]);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />
      <div className="space-y-6 px-4 py-6 sm:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 shadow-xl shadow-slate-900/5 backdrop-blur-sm transition-colors dark:border-slate-800 dark:bg-slate-950/80">
          <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
                  <Sparkles className="h-3.5 w-3.5" />
                  Profile Hub
                </div>
                <div>
                  <h1 className="text-3xl font-semibold sm:text-4xl">
                    {user?.first_name ? `${user.first_name}'s Profile` : 'Your Profile'}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-blue-50 sm:text-base">
                    Manage your identity, role-specific workspace access, and personal details from one refined interface.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  href={workspacePath}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left shadow-lg shadow-blue-900/10 transition hover:bg-white/15"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">Workspace</p>
                  <p className="mt-1 text-xs text-blue-50">Open your main portal</p>
                </Link>
                <Link
                  href="/profile"
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left shadow-lg shadow-blue-900/10 transition hover:bg-white/15"
                >
                  <Settings className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">Account</p>
                  <p className="mt-1 text-xs text-blue-50">Review personal settings</p>
                </Link>
                <Link
                  href={workspacePath}
                  className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left shadow-lg shadow-blue-900/10 transition hover:bg-white/15"
                >
                  <Bell className="h-5 w-5" />
                  <p className="mt-3 text-sm font-semibold">Updates</p>
                  <p className="mt-1 text-xs text-blue-50">Check messages and alerts</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <UserProfile />
      </div>
    </div>
  );
}
