'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import { confirmAdCheckout } from '../../api/ads';
import { CheckCircle2 } from 'lucide-react';

export default function AdSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('Confirming payment...');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setMessage('Missing payment session.');
      return;
    }
    confirmAdCheckout(sessionId)
      .then((data) => setMessage(data.message || 'Payment successful!'))
      .catch(() => setMessage('Payment received. Admin will review your ad soon.'));
  }, [searchParams]);

  return (
    <div className="page-shell">
      <Navigation />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thank you!</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{message}</p>
        <button
          type="button"
          onClick={() => router.push('/inbox')}
          className="mt-8 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white"
        >
          Back to inbox
        </button>
      </main>
    </div>
  );
}
