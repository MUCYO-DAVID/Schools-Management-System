'use client';

import { useEffect, useState } from 'react';
import { Check, X, Megaphone, RefreshCw, Mail, User, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdminAds, reviewAdCampaign, type AdCampaign } from '../api/ads';

import { BACKEND_URL as BACKEND } from '@/lib/backend';

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'pending_review', label: 'Pending approval' },
  { value: 'active', label: 'Live' },
  { value: 'rejected', label: 'Rejected' },
  { value: '', label: 'All' },
];

type Props = {
  onReviewed?: () => void;
};

export default function AdminAdsPanel({ onReviewed }: Props) {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [filter, setFilter] = useState('pending_review');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAds(filter || undefined);
      setCampaigns(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load ad campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const handleReview = async (id: number, action: 'approve' | 'reject') => {
    let admin_notes: string | undefined;
    if (action === 'reject') {
      const note = window.prompt('Rejection reason (optional, shown to advertiser):');
      if (note === null) return;
      admin_notes = note.trim() || undefined;
    }

    try {
      await reviewAdCampaign(id, action, admin_notes);
      toast.success(
        action === 'approve'
          ? 'Ad approved — 10-day free trial started'
          : 'Ad rejected'
      );
      await load();
      onReviewed?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Submitted campaigns</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value || 'all'}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                filter === value
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={load}
            title="Refresh"
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading applications...</p>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600">
            {filter === 'pending_review'
              ? 'No ad applications waiting for approval.'
              : 'No campaigns in this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              {c.media_type === 'image' ? (
                <img
                  src={`${BACKEND}${c.media_url}`}
                  alt={c.title}
                  className="mb-3 h-40 w-full rounded-lg object-cover bg-gray-100"
                />
              ) : (
                <video
                  src={`${BACKEND}${c.media_url}`}
                  className="mb-3 h-40 w-full rounded-lg bg-gray-900"
                  controls
                />
              )}

              <h4 className="font-bold text-gray-900">{c.title}</h4>
              {c.description && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{c.description}</p>
              )}

              <div className="mt-3 space-y-1.5 rounded-lg bg-gray-50 p-3 text-sm">
                <p className="flex items-center gap-2 text-gray-800">
                  <User className="h-4 w-4 shrink-0 text-gray-500" />
                  <span>
                    <span className="font-medium">Applicant:</span>{' '}
                    {c.advertiser_name || 'Unknown'}
                  </span>
                </p>
                <p className="flex items-center gap-2 text-gray-800">
                  <Mail className="h-4 w-4 shrink-0 text-gray-500" />
                  <span className="truncate">
                    {c.advertiser_email || c.user_email || '—'}
                  </span>
                </p>
                {c.company_name && (
                  <p className="text-gray-700">
                    <span className="font-medium">Company:</span> {c.company_name}
                  </p>
                )}
                <p className="flex items-center gap-2 text-gray-600 text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  Placement: {c.placement || 'home'} · {c.amount?.toLocaleString()} FRW
                </p>
                <p className="flex items-center gap-2 text-gray-600 text-xs">
                  <Calendar className="h-3.5 w-3.5" />
                  Applied {new Date(c.created_at).toLocaleString()}
                </p>
                <p className="text-xs">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 font-semibold ${
                      c.status === 'pending_review'
                        ? 'bg-amber-100 text-amber-800'
                        : c.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                  {c.payment_status && (
                    <span className="ml-2 text-gray-500">· {c.payment_status}</span>
                  )}
                  {c.trial_ends_at && (
                    <span className="ml-2 text-gray-500">
                      · Trial until {new Date(c.trial_ends_at).toLocaleDateString()}
                    </span>
                  )}
                </p>
                {c.admin_notes && (
                  <p className="text-xs text-red-700 mt-1">Note: {c.admin_notes}</p>
                )}
              </div>

              {c.click_url && (
                <a
                  href={c.click_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                >
                  Link: {c.click_url}
                </a>
              )}

              {c.status === 'pending_review' && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleReview(c.id, 'approve')}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" /> Approve (10-day trial)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(c.id, 'reject')}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
