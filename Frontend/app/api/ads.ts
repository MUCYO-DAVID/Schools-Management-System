import { BASE_URL } from '@/api/school';

const API = `${BASE_URL}/api/ads`;

const authHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  if (!text) {
    throw new Error(res.ok ? 'Empty response from server' : `Server error (${res.status})`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      text.startsWith('<')
        ? `Server error (${res.status}). Restart backend and run npm run migrate:ads`
        : text.slice(0, 200)
    );
  }
}

export interface AdCampaign {
  id: number;
  title: string;
  description?: string;
  media_type: 'image' | 'video';
  media_url: string;
  click_url?: string;
  company_name?: string;
  advertiser_name?: string;
  advertiser_email?: string;
  user_email?: string;
  placement?: string;
  amount: number;
  currency: string;
  payment_status: string;
  status: string;
  admin_notes?: string;
  trial_ends_at?: string;
  ends_at?: string;
  created_at: string;
}

export interface AdPricing {
  success: boolean;
  amount: number;
  currency: string;
  currencyLabel: string;
  trialDays: number;
  renewalDays: number;
  renewalAmount: number;
  message: string;
}

export const fetchActiveAds = async (placement = 'home'): Promise<AdCampaign[]> => {
  const res = await fetch(`${API}/active?placement=${placement}`);
  if (!res.ok) return [];
  const data = await parseJsonResponse(res);
  return data.ads || [];
};

export const fetchAdPricing = async (): Promise<AdPricing> => {
  const res = await fetch(`${API}/pricing`);
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error(data.message || 'Failed to load pricing');
  return data;
};

export const submitAdCampaign = async (form: FormData) => {
  const res = await fetch(`${API}`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error(data.message || 'Failed to submit ad');
  return data;
};

export const renewAdSandbox = async (campaignId: number) => {
  const res = await fetch(`${API}/${campaignId}/renew-sandbox`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error(data.message || 'Renewal failed');
  return data;
};

export const fetchAdminAds = async (status?: string) => {
  const q = status ? `?status=${status}` : '';
  const res = await fetch(`${API}/admin/all${q}`, { headers: authHeaders() });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error(data.message || 'Failed to load ads');
  return data.campaigns as AdCampaign[];
};

export const reviewAdCampaign = async (
  id: number,
  action: 'approve' | 'reject',
  admin_notes?: string
) => {
  const res = await fetch(`${API}/admin/${id}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ action, admin_notes }),
  });
  const data = await parseJsonResponse(res);
  if (!res.ok) throw new Error(data.message || 'Review failed');
  return data;
};
