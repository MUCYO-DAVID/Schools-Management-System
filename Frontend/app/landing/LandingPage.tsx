'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';
import {
  Search,
  ArrowRight
} from 'lucide-react';
import AuthBackground from '../components/AuthBackground';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/auth/signin?redirect=/student?tab=browse${searchValue.trim() ? `&search=${encodeURIComponent(searchValue)}` : ''}`);
      return;
    }
    if (searchValue.trim()) {
      router.push(`/student?tab=browse&search=${encodeURIComponent(searchValue)}`);
    } else {
      router.push('/student?tab=browse');
    }
  }, [isAuthenticated, searchValue, router]);

  const handleBrowseSchools = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/student?tab=browse');
    } else {
      router.push('/student?tab=browse');
    }
  }, [isAuthenticated, router]);

  const handleExploreRwanda = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/home');
    } else {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const handleLearnMore = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/about');
    } else {
      router.push('/about');
    }
  }, [isAuthenticated, router]);

  return (
    <AuthBackground>
      {/* Header */}
      <header className="relative z-20 px-6 sm:px-12 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="RSBS Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight group-hover:text-purple-400 transition-colors">
            RSBS
          </h1>
        </Link>
        <Link
          href="/auth/signin"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold px-6 py-2 rounded-lg transition-all shadow-lg shadow-purple-500/20 active:scale-95"
        >
          Sign In
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex flex-1 flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pb-32">
        <div className="max-w-[950px] mx-auto">
          <h1 className="text-white text-[3.5rem] sm:text-[4.5rem] font-extrabold leading-[1.05] mb-6 tracking-tight">
            Unlimited learning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">schools</span>, and more.
          </h1>
          <h2 className="text-slate-200 text-xl sm:text-2xl font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Connecting Rwanda's educational landscape. Discover anywhere. Access anytime.
          </h2>

          <form onSubmit={handleSearch} className="max-w-[750px] mx-auto mt-8">
            <h3 className="text-slate-300 text-lg sm:text-xl font-normal mb-6">
              Ready to explore? Search for schools or register to get started.
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
              <div className="relative w-full sm:w-[65%] h-14 sm:h-[64px]">
                <input
                  id="search"
                  type="text"
                  placeholder=" "
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full h-full bg-transparent peer px-6 pt-5 pb-1 text-white text-base focus:outline-none transition-all placeholder-transparent"
                />
                <label
                  htmlFor="search"
                  className="absolute left-6 top-5 text-[#b3b3b3] font-medium text-base transition-all peer-focus:text-[11px] peer-focus:top-2 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:top-2 pointer-events-none uppercase tracking-widest"
                >
                  Search your favorite school
                </label>
              </div>
              <button
                type="submit"
                className="w-full sm:w-[35%] h-14 sm:h-[64px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl sm:rounded-l-none sm:rounded-r-xl flex items-center justify-center transition-all px-4 group shadow-lg shadow-purple-500/20 active:scale-[0.98]"
              >
                <span className="tracking-widest">GET STARTED</span>
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </AuthBackground>
  );
}
