'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const AIChatBot = dynamic(() => import('./AIChatBot'), { ssr: false });

export default function AIChatBotLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      if (!cancelled) {
        setReady(true);
      }
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(markReady, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = window.setTimeout(markReady, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;

  return <AIChatBot />;
}
