// api/schools.ts
import type { School } from "@/app/types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchSchools(): Promise<School[]> {
  const res = await fetch(`${BASE_URL}/api/schools`);
  if (!res.ok) throw new Error("Failed to fetch schools");
  return res.json();
}


export async function addSchool(schoolData: Omit<School, "id">): Promise<School> {
  const schoolWithId = {
    ...schoolData,
    id: crypto.randomUUID(),
    name_rw: schoolData.nameRw,
  };
  delete schoolWithId.nameRw;

  const res = await fetch(`${BASE_URL}/api/schools`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schoolWithId),
  });

  if (!res.ok) throw new Error("Failed to add school");
  return res.json();
}

export async function updateSchool(
  id: string,
  schoolData: Omit<School, "id">
): Promise<School> {
  const schoolToUpdate = {
    ...schoolData,
    name_rw: schoolData.nameRw,
  };
  delete schoolToUpdate.nameRw;

  const res = await fetch(`${BASE_URL}/api/schools/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schoolToUpdate),
  });

  if (!res.ok) throw new Error("Failed to update school");
  return res.json();
}

export async function deleteSchool(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/schools/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete school");
}

  export const formatTimeAgo = (timestamp: string | number | Date) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };