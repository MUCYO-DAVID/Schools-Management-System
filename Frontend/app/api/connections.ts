const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwandaschoolsbridgesystem.onrender.com';

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

export async function sendConnectionRequest(receiverId: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/connections/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ receiver_id: receiverId }),
  });

  if (!res.ok) throw new Error('Failed to send request');
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
