'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { GraduationCap, School, Users, BookOpen, Award, Star } from 'lucide-react';

const SignUpPage = () => {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwandaschoolsbridgesystem.onrender.com';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'leader' | 'teacher'>('student');
  const [schoolName, setSchoolName] = useState('');
  const [subject, setSubject] = useState('');
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
      const payload: any = { 
        first_name: firstName, 
        last_name: lastName, 
        email, 
        password, 
        role 
      };

      // Add teacher-specific fields if role is teacher
      if (role === 'teacher') {
        payload.school_name = schoolName;
        payload.subject = subject;
      }

      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
        } else if (data.user.role === 'teacher') {
          router.push('/home'); // Teachers go to home dashboard
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
    <div className="min-h-screen bg-background dark:bg-neutral-900 flex items-center justify-center p-md">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-xl">
          <div className="flex items-center justify-center gap-md mb-md">
            <div className="w-10 h-10 bg-gradient-to-r from-rwanda-blue via-rwanda-yellow to-rwanda-green rounded-lg"></div>
            <h1 className="text-h1 font-bold text-foreground">RSBS</h1>
          </div>
          <p className="text-body-md text-muted-foreground">Rwanda School Bridge System</p>
        </div>

        {/* Main Card */}
        <div className="card-standard">
          <div className="text-center mb-xl">
            <h2 className="text-h2 font-bold text-foreground mb-md">Create your account</h2>
            <p className="text-body-md text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-rwanda-blue hover:text-rwanda-blue-dark transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-lg p-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-200 text-body-sm">{error}</p>
            </div>
          )}

            <form onSubmit={handleSubmit} className="space-y-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label htmlFor="firstName" className="block text-body-md font-semibold text-foreground mb-sm">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className="w-full px-lg py-md border border-border rounded-lg bg-background dark:bg-neutral-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent transition-all"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-body-md font-semibold text-foreground mb-sm">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="w-full px-lg py-md border border-border rounded-lg bg-background dark:bg-neutral-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent transition-all"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-body-md font-semibold text-foreground mb-sm">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-lg py-md border border-border rounded-lg bg-background dark:bg-neutral-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-body-md font-semibold text-foreground mb-sm">
                  I am registering as:
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'student' | 'leader' | 'teacher')}
                  className="w-full px-lg py-md border border-border rounded-lg bg-background dark:bg-neutral-700 text-foreground focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent transition-all"
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="leader">School Leader</option>
                </select>
                {role === 'leader' && (
                  <div className="mt-md p-md bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-body-sm text-amber-800 dark:text-amber-200">
                      School leaders will need to verify their identity with additional questions during login.
                    </p>
                  </div>
                )}
                {role === 'teacher' && (
                  <div className="mt-md p-md bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-body-sm text-blue-800 dark:text-blue-200">
                      Please provide your school and subject information below.
                    </p>
                  </div>
                )}
              </div>

              {role === 'teacher' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div>
                    <label htmlFor="schoolName" className="block text-body-md font-semibold text-foreground mb-sm">
                      School Name
                    </label>
                    <input
                      id="schoolName"
                      type="text"
                      placeholder="Rwanda High School"
                      className="w-full px-lg py-md border border-border rounded-lg bg-background dark:bg-neutral-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent transition-all"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-body-md font-semibold text-foreground mb-sm">
                      Subject/Lesson
                    </label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="e.g., Mathematics"
                      className="w-full px-lg py-md border border-border rounded-lg bg-background dark:bg-neutral-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent transition-all"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-body-md font-semibold text-foreground mb-sm">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="w-full px-lg py-md border border-border rounded-lg bg-background dark:bg-neutral-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-body-md font-semibold text-foreground mb-sm">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full px-lg py-md border border-border rounded-lg bg-background dark:bg-neutral-700 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-rwanda-blue focus:border-transparent transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-start gap-md">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-sm h-5 w-5 text-rwanda-blue border-border rounded cursor-pointer"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                />
                <label htmlFor="terms" className="text-body-sm text-muted-foreground cursor-pointer">
                  I agree to the{' '}
                  <Link href="#" className="text-rwanda-blue hover:text-rwanda-blue-dark font-semibold transition-colors">
                    Terms & Conditions
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-lg py-md rounded-lg bg-rwanda-blue hover:bg-rwanda-blue-dark text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 mt-md"
              >
                Create Account
              </button>
            </form>

            <div className="mt-xl pt-lg border-t border-border hidden md:block">
              <p className="text-center text-body-sm text-muted-foreground mb-lg">Join thousands of students and educators</p>
              <div className="flex justify-center gap-xl text-muted-foreground">
                <div className="flex items-center gap-sm flex-col text-center">
                  <Users className="w-6 h-6" />
                  <span className="text-body-sm font-medium">50K+ Students</span>
                </div>
                <div className="flex items-center gap-sm flex-col text-center">
                  <School className="w-6 h-6" />
                  <span className="text-body-sm font-medium">500+ Schools</span>
                </div>
                <div className="flex items-center gap-sm flex-col text-center">
                  <Star className="w-6 h-6" />
                  <span className="text-body-sm font-medium">4.8 Rating</span>
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
