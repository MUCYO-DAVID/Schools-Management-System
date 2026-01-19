'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { GraduationCap, School, Users, BookOpen, Award, Star } from 'lucide-react';

const SignUpPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'leader'>('student');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      // Auto-login the user after successful registration
      if (data.token && data.user) {
        login(data.token, data.user);
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else if (data.user.role === 'leader') {
          router.push('/home');
        } else {
          router.push('/student');
        }
      } else {
        router.push('/auth/signin');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-700 relative overflow-hidden flex items-center justify-center p-4">
      {/* Floating decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GraduationCap className="absolute top-20 left-10 w-16 h-16 text-white/10 animate-float" style={{ animationDelay: '0s' }} />
        <School className="absolute top-40 right-20 w-20 h-20 text-white/10 animate-float" style={{ animationDelay: '1s' }} />
        <BookOpen className="absolute bottom-20 left-20 w-14 h-14 text-white/10 animate-float" style={{ animationDelay: '2s' }} />
        <Award className="absolute bottom-40 right-10 w-18 h-18 text-white/10 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-yellow-400 to-green-500 rounded-lg"></div>
            <h1 className="text-3xl font-bold text-white">RSBS</h1>
          </div>
          <p className="text-blue-100 text-sm">Rwanda School Bridge System</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  I am registering as:
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'leader')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  required
                >
                  <option value="student">Student</option>
                  <option value="leader">School Leader</option>
                </select>
                {role === 'leader' && (
                  <p className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    ⚠️ School leaders will need to verify their identity with additional questions during login.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms & Conditions
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Account
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">Join thousands of students and educators</p>
              <div className="flex justify-center gap-6 text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">50K+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5" />
                  <span className="text-sm">500+ Schools</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span className="text-sm">4.8 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
