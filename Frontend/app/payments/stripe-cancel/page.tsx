'use client';

import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';

export default function StripeCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Cancelled</h1>
          <p className="text-sm text-gray-600 mb-4">
            Your Stripe test payment was cancelled. You can try again from the Payments section.
          </p>
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
