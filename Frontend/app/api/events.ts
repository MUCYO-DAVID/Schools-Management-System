const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function fetchEvents(filters: {
  school_id?: string;
  start_date?: string;
  end_date?: string;
  event_type?: string;
} = {}) {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const res = await fetch(`${backendUrl}/api/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchEvent(id: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/events/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
}

export async function createEvent(eventData: {
  school_id?: string;
  title: string;
  description?: string;
  event_type?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  audience_role?: string;
  reminder_enabled?: boolean;
  reminder_minutes?: number;
}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function updateEvent(id: number, eventData: Partial<{
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  audience_role: string;
  reminder_enabled: boolean;
  reminder_minutes: number;
}>) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

export async function deleteEvent(id: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/events/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
}

export async function rsvpToEvent(id: number, status: 'attending' | 'not_attending' | 'maybe') {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/events/${id}/rsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to RSVP");
  return res.json();
}

export async function getRSVPStatus(id: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/events/${id}/rsvp/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to get RSVP status");
  return res.json();
}

export async function getEventAttendees(id: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/events/${id}/attendees`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to get attendees");
  return res.json();
}
