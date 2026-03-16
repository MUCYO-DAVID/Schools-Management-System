'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmStripeSession } from '@/app/api/payments';
import Navigation from '../../components/Navigation';

export default function StripeSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your payment...');

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setMessage('Missing Stripe session.');
      return;
    }

    const confirm = async () => {
      try {
        await confirmStripeSession(sessionId);
        setStatus('success');
        setMessage('Payment confirmed successfully.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Payment confirmation failed.');
      }
    };

    confirm();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Stripe Payment</h1>
          <p className="text-sm text-gray-600 mb-4">{message}</p>
          <button
            onClick={() => router.push('/student')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white"
          >
            Back to Student Portal
          </button>
        </div>
      </div>
    </div>
  );
}
