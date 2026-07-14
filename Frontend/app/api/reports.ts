import { BACKEND_URL } from '@/lib/backend';

export interface CountRow {
  count: number;
  [key: string]: any;
}

export interface AdminReportOverview {
  schoolsByType: { type: string; count: number }[];
  totalSchools: number;
  usersByRole: { role: string; count: number }[];
  applicationsByStatus: { status: string; count: number }[];
  adsByStatus: { status: string; count: number }[];
  adRevenueByCurrency: { currency: string; total: string }[];
  generatedAt: string;
}

export async function fetchAdminReportOverview(): Promise<AdminReportOverview> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}/api/reports/admin/overview`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized - please login again');
    if (response.status === 403) throw new Error('Access denied - admin role required');
    throw new Error(`Failed to fetch report overview (${response.status})`);
  }

  return response.json();
}
