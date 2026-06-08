'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { fetchActiveAds, type AdCampaign } from '../api/ads';
import { getImageUrl } from '@/lib/image-utils';
import { BACKEND_URL as BACKEND } from '@/lib/backend';

function mediaSrc(url: string) {
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url.startsWith('/') ? url : `/${url}`}`;
}

export default function AdPlacement({
  placement = 'home',
  className = '',
}: {
  placement?: string;
  className?: string;
}) {
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchActiveAds(placement).then(setAds).catch(() => setAds([]));
  }, [placement]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % ads.length), 10000);
    return () => clearInterval(t);
  }, [ads.length]);

  if (!ads.length) return null;

  const ad = ads[index];

  return (
    <article
      className={`w-full max-w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-2.5 py-1.5 dark:border-slate-800">
        <Megaphone className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Sponsored
        </span>
        {ad.company_name && (
          <span className="ml-auto truncate text-[10px] font-semibold text-slate-700 dark:text-slate-300">
            {ad.company_name}
          </span>
        )}
      </div>

      <div className="flex h-28 w-full items-center justify-center bg-slate-50 p-2 dark:bg-slate-800/50">
        {ad.media_type === 'video' ? (
          <video
            src={mediaSrc(ad.media_url)}
            className="max-h-full max-w-full object-contain"
            controls
            muted
            playsInline
          />
        ) : (
          <img
            src={getImageUrl(ad.media_url) || mediaSrc(ad.media_url)}
            alt={ad.title}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      <div className="space-y-1 p-2.5">
        <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-white">{ad.title}</h4>
        {ad.description && (
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{ad.description}</p>
        )}
        {ad.click_url && (
          <a
            href={ad.click_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-purple-600 hover:text-purple-800 dark:text-purple-400"
          >
            Learn more <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>

      {ads.length > 1 && (
        <div className="flex justify-center gap-1 pb-2">
          {ads.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ad ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1 w-1 rounded-full ${i === index ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            />
          ))}
        </div>
      )}
    </article>
  );
}
