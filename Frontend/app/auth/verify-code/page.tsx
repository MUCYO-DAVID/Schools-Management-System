'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import Link from 'next/link';

export default function VerifyCodePage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [emailForVerification, setEmailForVerification] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // In a real application, you'd likely get the email from a secure session or context
    // For this example, we'll assume it's passed via localStorage or a query param
    const storedEmail = localStorage.getItem('userEmailForVerification');
    if (storedEmail) {
      setEmailForVerification(storedEmail);
    } else {
      // If no email is found, redirect back to sign-in
      router.push('/auth/signin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailForVerification) {
      setError('Email not found for verification. Please sign in again.');
      return;
    }

    try {
      // This is a placeholder for your backend API call to verify the code
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailForVerification, code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Code verification failed');
      }

      const { token, user } = await response.json();
      login(token, user); // Log in the user after successful verification
      localStorage.removeItem('userEmailForVerification'); // Clean up

      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during verification');
    }
  };

  const handleResendCode = async () => {
    setError('');
    if (!emailForVerification) {
      setError('Email not found to resend code.');
      return;
    }
    try {
      // Placeholder for your backend API call to resend the code
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailForVerification }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend code');
      }
      alert('Verification code sent to your email!');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while resending code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#007A3D] via-[#FDB913] to-[#005BBB] p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            A verification code has been sent to {emailForVerification || 'your email'}. Please enter it below.
          </p>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Verification Code</label>
            <input
              id="code"
              name="code"
              type="text"
              autoComplete="off"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FDB913] focus:border-[#FDB913] sm:text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#007A3D] hover:bg-[#005BBB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FDB913]"
            >
              Verify Code
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              className="font-medium text-[#005BBB] hover:text-[#007A3D]"
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
