import { BASE_URL } from '@/api/school';

const API_URL = `${BASE_URL}/api/portal`;

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Announcement {
  id: number;
  title: string;
  body: string;
  audience_role: string;
  created_at: string;
}

export interface MessageItem {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_email?: string;
  recipient_first_name?: string;
  recipient_last_name?: string;
  recipient_email?: string;
}

export interface PortalDocument {
  id: number;
  title: string;
  file_url: string;
  audience_role: string;
  created_at: string;
}

export interface RecipientUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const response = await fetch(`${API_URL}/announcements`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch announcements');
  return response.json();
};

export const createAnnouncement = async (payload: {
  title: string;
  body: string;
  audience_role: string;
}): Promise<Announcement> => {
  const response = await fetch(`${API_URL}/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create announcement');
  }
  return response.json();
};

export const fetchInbox = async (): Promise<MessageItem[]> => {
  const response = await fetch(`${API_URL}/messages/inbox`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch inbox messages');
  return response.json();
};

export const fetchSent = async (): Promise<MessageItem[]> => {
  const response = await fetch(`${API_URL}/messages/sent`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch sent messages');
  return response.json();
};

export const sendMessage = async (payload: {
  recipient_id: number;
  subject?: string;
  body: string;
}): Promise<MessageItem> => {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }
  return response.json();
};

export const markMessageRead = async (id: number): Promise<MessageItem> => {
  const response = await fetch(`${API_URL}/messages/${id}/read`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to mark message as read');
  return response.json();
};

export const fetchDocuments = async (): Promise<PortalDocument[]> => {
  const response = await fetch(`${API_URL}/documents`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
};

export const uploadDocument = async (payload: {
  title: string;
  audience_role: string;
  file: File;
}): Promise<PortalDocument> => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('audience_role', payload.audience_role);
  formData.append('file', payload.file);

  const response = await fetch(`${API_URL}/documents`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload document');
  }
  return response.json();
};

export const fetchRecipients = async (role?: string): Promise<RecipientUser[]> => {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  const response = await fetch(`${API_URL}/recipients${query}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch recipients');
  return response.json();
};
