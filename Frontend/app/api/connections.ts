import { BASE_URL } from '@/api/school';

const backendUrl = BASE_URL;

export async function searchUsers(query: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/users/search?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to search users');
  return res.json();
}

export async function fetchSuggestedUsers() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/connections/suggested`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch suggested users');
  return res.json();
}

export async function fetchAllUsers() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/connections/all-users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch all users');
  return res.json();
}

export async function sendConnectionRequest(receiverId: number) {
  const token = localStorage.getItem('token');
  console.log('API: sendConnectionRequest to', receiverId, 'with token', token?.substring(0, 10) + '...');
  
  const res = await fetch(`${backendUrl}/api/connections/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ receiver_id: receiverId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('API Error details:', errorData);
    throw new Error(errorData.message || 'Failed to send request');
  }
  return res.json();
}

export async function respondToConnectionRequest(requestId: number, action: 'accepted' | 'rejected') {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/connections/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ request_id: requestId, action }),
  });

  if (!res.ok) throw new Error('Failed to respond to request');
  return res.json();
}

export async function fetchFriends() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/connections/friends`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch friends');
  return res.json();
}

export async function fetchPendingRequests() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/connections/pending`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch pending requests');
  return res.json();
}

export async function removeConnection(userId: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/connections/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to remove connection');
  return res.json();
}
