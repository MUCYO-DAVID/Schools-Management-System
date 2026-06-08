import { BACKEND_URL as backendUrl } from "@/lib/backend";

export interface StudentSearchResult {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  school_id?: string | null;
}

export async function searchStudents(params: { q: string; school_id?: string; limit?: number }) {
  const token = localStorage.getItem("token");
  const qs = new URLSearchParams();
  qs.set("q", params.q);
  if (params.school_id) qs.set("school_id", params.school_id);
  if (params.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`${backendUrl}/api/users/students/search?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to search students");
  }
  return (await res.json()) as StudentSearchResult[];
}

