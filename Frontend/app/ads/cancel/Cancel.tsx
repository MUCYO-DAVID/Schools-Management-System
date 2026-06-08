'use client';

import Navigation from '../../components/Navigation';
import { useRouter } from 'next/navigation';

export default function AdCancelPage() {
  const router = useRouter();
  return (
    <div className="page-shell">
      <Navigation />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment cancelled</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Your ad was saved but not paid. You can complete payment later from your account.
        </p>
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
