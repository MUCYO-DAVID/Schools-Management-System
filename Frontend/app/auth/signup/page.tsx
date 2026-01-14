'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';

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
      console.log('Attempting to register user...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password, role }),
      });

      console.log('Response received:', response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful');

      // Auto-login the user after successful registration
      if (data.token && data.user) {
        login(data.token, data.user);
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else if (data.user.role === 'leader') {
          // Leaders need to verify, but they just signed up, so redirect to home
          router.push('/home');
        } else {
          // Students go to student page
          router.push('/student');
        }
      } else {
        // Fallback: redirect to signin if no token
        router.push('/auth/signin');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="relative flex w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Left Section - Rwanda Flag Inspired */}
        <div className="w-1/2 bg-gradient-to-br from-blue-500 via-yellow-400 to-green-500 flex flex-col items-center justify-center p-8 text-white">
          <div className="text-4xl font-bold mb-4">AMU</div>
          <h2 className="text-2xl font-semibold text-center mb-6">Capturing Moments, Creating Memories</h2>
          <p className="text-center text-sm">Sign up to start your journey with us.</p>
          <div className="absolute bottom-4 flex space-x-2">
            <span className="block w-2 h-2 bg-white rounded-full"></span>
            <span className="block w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="block w-2 h-2 bg-gray-400 rounded-full"></span>
          </div>
        </div>

        {/* Right Section - Sign Up Form */}
        <div className="w-1/2 p-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
          <p className="text-gray-400 mb-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:underline">
              Log in
            </Link>
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last name"
                className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                I am registering as:
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'leader')}
                className="w-full p-3 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="student">Student</option>
                <option value="leader">School Leader</option>
              </select>
              {role === 'leader' && (
                <p className="mt-2 text-xs text-yellow-400">
                  ⚠️ School leaders will need to verify their identity with additional questions during login.
                </p>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* You can add an eye icon here to toggle password visibility */}
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label htmlFor="terms" className="ml-2 block text-gray-400 text-sm">
                I agree to the{' '}
                <Link href="#" className="text-purple-400 hover:underline">
                  Terms & Conditions
                </Link>
              </label>
            </div>
            <button
              type="submit"
              className="w-full p-3 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 transition duration-200"
            >
              Create account
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="mx-4 text-gray-500">Or register with</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <div className="flex space-x-4">
            <button className="flex-1 flex items-center justify-center p-3 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition duration-200">
              Google
            </button>
            <button className="flex-1 flex items-center justify-center p-3 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition duration-200">
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;