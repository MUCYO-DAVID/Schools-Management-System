'use client';

import { useEffect, useState } from 'react';
import { X, Upload, Megaphone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitAdCampaign, fetchAdPricing, type AdPricing } from '../api/ads';
import { useAuth } from '../providers/AuthProvider';

export default function AdvertiseModal({ onClose }: { onClose: () => void }) {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pricing, setPricing] = useState<AdPricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchAdPricing().then(setPricing).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to advertise');
      return;
    }
    if (!file) {
      toast.error('Upload an image or video');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('company_name', companyName);
      fd.append('click_url', clickUrl);
      fd.append('placement', 'global');
      fd.append('media', file);

      await submitAdCampaign(fd);
      setDone(true);
      toast.success('Ad submitted for admin review');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const trialDays = pricing?.trialDays ?? 10;
  const priceFrw = pricing?.amount ?? 10000;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Advertise on RSBS</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <strong>{trialDays} days FREE</strong> after admin approves your ad.
          <br />
          When the trial ends, pay <strong>{priceFrw.toLocaleString()} FRW</strong> to keep advertising (Rwanda pricing).
        </div>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submitted!</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              An admin will review your ad. Once approved, you get {trialDays} days free on RSBS.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              required
              placeholder="Ad title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <input
              placeholder="Company / school name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <textarea
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <input
              placeholder="Website link (optional)"
              value={clickUrl}
              onChange={(e) => setClickUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 p-6 dark:border-slate-600">
              <Upload className="h-8 w-8 text-purple-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {file ? file.name : 'Image or video (max 25MB)'}
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-600 py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for review (free trial)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
