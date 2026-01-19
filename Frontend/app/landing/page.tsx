'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';
import {
  GraduationCap,
  BookOpen,
  School,
  Users,
  Award,
  MapPin,
  Search,
  ArrowRight,
  Star,
  Globe
} from 'lucide-react';

interface FloatingIcon {
  id: number;
  icon: React.ElementType;
  position: { x: number; y: number };
  size: number;
  rotation: number;
  delay: number;
}

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [currentHeadline, setCurrentHeadline] = useState(0);

  const headlines = useMemo(() => [
    'Find the perfect school for your future',
    'Discover top-rated schools in Rwanda',
    'Connect with Rwanda\'s best education',
    'Your journey to excellence starts here'
  ], []);

  const iconTypes = useMemo(() => [
    { Icon: GraduationCap, color: 'text-blue-500' },
    { Icon: BookOpen, color: 'text-yellow-500' },
    { Icon: School, color: 'text-green-500' },
    { Icon: Users, color: 'text-blue-400' },
    { Icon: Award, color: 'text-yellow-400' },
    { Icon: Star, color: 'text-green-400' },
  ], []);

  // Initialize floating icons - only once
  useEffect(() => {
    const icons: FloatingIcon[] = [];
    for (let i = 0; i < 12; i++) {
      const iconType = iconTypes[i % iconTypes.length];
      icons.push({
        id: i,
        icon: iconType.Icon,
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
        size: 40 + Math.random() * 30,
        rotation: Math.random() * 360,
        delay: Math.random() * 2,
      });
    }
    setFloatingIcons(icons);
  }, [iconTypes]);

  // Rotate headlines
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [headlines.length]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-700 relative overflow-hidden">
      {/* Floating animated icons */}
      {floatingIcons.map((item) => {
        const IconComponent = item.icon;
        const iconType = iconTypes.find((t) => t.Icon === item.icon);
        return (
          <div
            key={item.id}
            className="absolute opacity-20 animate-float"
            style={{
              left: `${item.position.x}%`,
              top: `${item.position.y}%`,
              transform: `rotate(${item.rotation}deg)`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <IconComponent
              className={`${iconType?.color || 'text-white'} transition-all duration-1000`}
              size={item.size}
            />
          </div>
        );
      })}

      {/* Header with Sign In and Sign Up */}
      <header className="relative z-10 px-6 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 via-yellow-400 to-green-500 rounded"></div>
            <span className="text-white font-bold text-xl">RSBS</span>
            <span className="text-white text-sm hidden sm:inline ml-2">Rwanda School Bridge System</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth/signin"
              className="text-white hover:text-blue-200 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl w-full">
          {/* Animated Headline */}
          <div className="h-20 sm:h-24 md:h-28 mb-8 flex items-center justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white transition-all duration-500 animate-fade-in">
              {headlines[currentHeadline]}
            </h1>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden">
              <div className="pl-6 pr-4">
                <MapPin className="w-6 h-6 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for schools by name or location..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 py-4 text-gray-900 placeholder-gray-400 focus:outline-none text-base sm:text-lg"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full m-2 transition-colors flex items-center justify-center"
                aria-label="Search schools"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
            <p className="mt-4 text-blue-100 text-sm">
              <Link href="/auth/signin" className="underline hover:text-white">
                Sign in for saved preferences
              </Link>
            </p>
          </form>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              onClick={handleBrowseSchools}
              className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 flex items-center gap-2"
            >
              <School className="w-5 h-5" />
              Browse Schools
            </button>
            <button
              onClick={handleExploreRwanda}
              className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 flex items-center gap-2"
            >
              <Globe className="w-5 h-5" />
              Explore Rwanda
            </button>
            <button
              onClick={handleLearnMore}
              className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 flex items-center gap-2"
            >
              <Award className="w-5 h-5" />
              Learn More
            </button>
          </div>
        </div>
      </main>

    </div>
  );
}
