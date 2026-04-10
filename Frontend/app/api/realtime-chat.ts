const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwandaschoolsbridgesystem.onrender.com';

// Get or create direct chat room between two users
export async function createDirectChat(otherUserId: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/chat/rooms/direct`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ other_user_id: otherUserId }),
  });

  if (!res.ok) throw new Error('Failed to create direct chat');
  return res.json();
}

// Get or create group chat room for a school
export async function createGroupChat(schoolId: string, name: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/chat/rooms/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ school_id: schoolId, name }),
  });

  if (!res.ok) throw new Error('Failed to create group chat');
  return res.json();
}

// Get user's chat rooms
export async function fetchChatRooms() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/chat/rooms`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch chat rooms');
  return res.json();
}

// Get messages for a chat room
export async function fetchChatMessages(roomId: number, limit: number = 50, offset: number = 0) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

// Send message
export async function sendChatMessage(roomId: number, message: string, messageType: string = 'text', attachment?: File) {
  const token = localStorage.getItem('token');
  
  let body: any;
  let headers: any = {
    'Authorization': `Bearer ${token}`,
  };

  if (attachment) {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('message_type', messageType);
    formData.append('attachment', attachment);
    body = formData;
    // Don't set Content-Type header for FormData, browser will do it automatically
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ message, message_type: messageType });
  }

  const res = await fetch(`${backendUrl}/api/chat/rooms/${roomId}/messages`, {
    method: 'POST',
    headers,
    body,
  });

  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

// Add member to group chat
export async function addChatRoomMember(roomId: number, userId: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/chat/rooms/${roomId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!res.ok) throw new Error('Failed to add member');
  return res.json();
}

// Get members of a chat room
export async function fetchChatRoomMembers(roomId: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/chat/rooms/${roomId}/members`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch members');
  return res.json();
}

// Get unread message count
export async function fetchUnreadCount() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/chat/unread-count`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
}
