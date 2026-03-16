import { BASE_URL } from '@/api/school';

const API_URL = `${BASE_URL}/api/payments`;

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface FeeSchedule {
  id: number;
  school_id: string | null;
  title: string;
  amount: number;
  currency: string;
  due_date?: string | null;
  school_name?: string | null;
}

export interface FeeInvoice {
  id: number;
  schedule_id: number | null;
  student_user_id: number | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  schedule_title?: string | null;
  school_name?: string | null;
}

export const fetchFeeSchedules = async (): Promise<FeeSchedule[]> => {
  const response = await fetch(`${API_URL}/schedules`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch fee schedules');
  return response.json();
};

export const createFeeSchedule = async (payload: {
  school_id?: string;
  title: string;
  amount: number;
  currency?: string;
  due_date?: string;
}): Promise<FeeSchedule> => {
  const response = await fetch(`${API_URL}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create fee schedule');
  }
  return response.json();
};

export const fetchFeeInvoices = async (): Promise<FeeInvoice[]> => {
  const response = await fetch(`${API_URL}/invoices`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch invoices');
  return response.json();
};

export const createInvoice = async (payload: { schedule_id: number; student_user_id?: number }): Promise<FeeInvoice> => {
  const response = await fetch(`${API_URL}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create invoice');
  }
  return response.json();
};

export const payInvoiceSandbox = async (invoice_id: number) => {
  const response = await fetch(`${API_URL}/sandbox/charge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ invoice_id }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to process payment');
  }
  return response.json();
};

export const createStripeCheckout = async (invoice_id: number, success_url?: string, cancel_url?: string) => {
  const response = await fetch(`${API_URL}/stripe/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ invoice_id, success_url, cancel_url }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create Stripe checkout');
  }
  return response.json();
};

export const confirmStripeSession = async (session_id: string) => {
  const response = await fetch(`${API_URL}/stripe/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ session_id }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to confirm Stripe payment');
  }
  return response.json();
};

export const fetchTransactions = async () => {
  const response = await fetch(`${API_URL}/transactions`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
};

export const fetchReceipt = async (invoiceId: number) => {
  const response = await fetch(`${API_URL}/invoices/${invoiceId}/receipt`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch receipt');
  return response.json();
};

export const initiateMobileMoneyPayment = async (payload: {
  invoice_id: number;
  provider: 'MTN' | 'Airtel';
  phone_number: string;
}) => {
  const response = await fetch(`${API_URL}/mobile-money/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initiate mobile money payment');
  }
  return response.json();
};

export const confirmMobileMoneyPayment = async (payload: {
  invoice_id: number;
  reference: string;
  provider: 'MTN' | 'Airtel';
}) => {
  const response = await fetch(`${API_URL}/mobile-money/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to confirm mobile money payment');
  }
  return response.json();
};
