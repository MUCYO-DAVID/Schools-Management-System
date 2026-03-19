'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/design-system/button';
import { Input } from '@/components/design-system/input';
import { Card } from '@/components/design-system/card';
import { Badge } from '@/components/design-system/badge';

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
      };

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

      if (data.token && data.user) {
        login(data.token, data.user);

        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'leader') {
          router.push('/schools');
        } else if (data.user.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      } else {
        router.push('/auth/login');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Brand section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary mb-4">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Rwanda School Bridge</h1>
          <p className="text-muted-foreground mt-2">Create your account to get started</p>
        </div>

        {/* Signup card */}
        <Card variant="elevated">
          {error && (
            <div className="p-4 mb-4 bg-danger/10 border border-danger/20 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
                required
              />
              <Input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Email */}
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              label="Email"
            />

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Register as
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'leader' | 'teacher')}
                className="w-full h-10 rounded-lg border border-input bg-input px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isLoading}
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="leader">School Leader</option>
              </select>
            </div>

            {/* Role-specific fields */}
            {role === 'leader' && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-xs text-warning">
                  School leaders will need to verify their identity with additional questions during login.
                </p>
              </div>
            )}

            {role === 'teacher' && (
              <>
                <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                  <p className="text-xs text-info">Please provide your school and subject information.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="School name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    disabled={isLoading}
                  />
                  <Input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {/* Password fields */}
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              label="Password"
            />

            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
              label="Confirm Password"
            />

            {/* Terms agreement */}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                disabled={isLoading}
                className="mt-1 rounded border-input"
                required
              />
              <span className="text-xs text-muted-foreground">
                I agree to the{' '}
                <Link href="#" className="text-primary hover:underline font-medium">
                  Terms & Conditions
                </Link>
              </span>
            </label>

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Trusted by thousands of students and educators
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
