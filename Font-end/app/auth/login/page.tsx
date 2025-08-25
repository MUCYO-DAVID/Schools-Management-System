'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
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
      // Assuming the backend returns a token or user data upon successful login
      localStorage.setItem('userToken', data.token); // Store token (or other relevant data)
      // Redirect to a protected page, e.g., dashboard or home
      router.push('/dashboard'); // You might need to create a dashboard page or redirect to home
    } catch (err: any) {
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
          <p className="text-center text-sm">Log in to continue your journey with us.</p>
          <div className="absolute bottom-4 flex space-x-2">
            <span className="block w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="block w-2 h-2 bg-white rounded-full"></span>
            <span className="block w-2 h-2 bg-gray-400 rounded-full"></span>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-1/2 p-8">
          <h2 className="text-3xl font-bold text-white mb-2">Log in to your account</h2>
          <p className="text-gray-400 mb-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-purple-400 hover:underline">
              Sign up
            </Link>
          </p>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
            <button
              type="submit"
              className="w-full p-3 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 transition duration-200"
            >
              Log in
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="mx-4 text-gray-500">Or log in with</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <div className="flex space-x-4">
            <button className="flex-1 flex items-center justify-center p-3 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition duration-200">
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
              Google
            </button>
            <button className="flex-1 flex items-center justify-center p-3 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition duration-200">
              <img src="/apple-icon.svg" alt="Apple" className="w-5 h-5 mr-2" />
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;