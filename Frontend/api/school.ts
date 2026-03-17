// api/schools.ts
import type { School } from "@/app/types";

export const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwandaschoolsbridgesystem.onrender.com';
const API_URL = `${BASE_URL}/api`;

const SCHOOLS_CACHE_TTL_MS = 2 * 60 * 1000;
let cachedSchools: { data: School[]; fetchedAt: number } | null = null;
const cachedTopSchools: Record<number, { data: School[]; fetchedAt: number }> = {};

export const fetchSchools = async (options?: { forceRefresh?: boolean }): Promise<School[]> => {
  if (!options?.forceRefresh && cachedSchools && Date.now() - cachedSchools.fetchedAt < SCHOOLS_CACHE_TTL_MS) {
    return cachedSchools.data;
  }
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/schools`, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch schools");
  }
  const data: any[] = await response.json();
  const mapped = data.map((school) => {
    const rawImages = school.image_urls;
    const image_urls =
      rawImages && typeof rawImages === "string"
        ? JSON.parse(rawImages).map((url: string) =>
            url.startsWith("http") ? url : `${BASE_URL}${url}`
          )
        : Array.isArray(rawImages)
          ? rawImages.map((url: string) =>
              url.startsWith("http") ? url : `${BASE_URL}${url}`
            )
          : [];

    const rating_total = school.rating_total ?? 0;
    const rating_count = school.rating_count ?? 0;
    const average_rating =
      rating_count > 0 ? rating_total / rating_count : 0;

    return {
      ...school,
      nameRw: school.name_rw || school.nameRw || "",
      image_urls,
      rating_total,
      rating_count,
      average_rating,
    } as School;
  });
  cachedSchools = { data: mapped, fetchedAt: Date.now() };
  return mapped;
};

export const fetchTopSchools = async (limit = 4, options?: { forceRefresh?: boolean }): Promise<School[]> => {
  const cached = cachedTopSchools[limit];
  if (!options?.forceRefresh && cached && Date.now() - cached.fetchedAt < SCHOOLS_CACHE_TTL_MS) {
    return cached.data;
  }
  const response = await fetch(`${API_URL}/schools/top?limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch top schools");
  }
  const data: any[] = await response.json();
  const mapped = data.map((school) => {
    const rawImages = school.image_urls;
    const image_urls =
      rawImages && typeof rawImages === "string"
        ? JSON.parse(rawImages).map((url: string) =>
            url.startsWith("http") ? url : `${BASE_URL}${url}`
          )
        : Array.isArray(rawImages)
          ? rawImages.map((url: string) =>
              url.startsWith("http") ? url : `${BASE_URL}${url}`
            )
          : [];

    const rating_total = school.rating_total ?? 0;
    const rating_count = school.rating_count ?? 0;
    const average_rating =
      rating_count > 0 ? rating_total / rating_count : 0;

    return {
      ...school,
      nameRw: school.name_rw || school.nameRw || "",
      image_urls,
      rating_total,
      rating_count,
      average_rating,
    } as School;
  });
  cachedTopSchools[limit] = { data: mapped, fetchedAt: Date.now() };
  return mapped;
};

export const fetchNearbySchools = async (latitude: number, longitude: number, radius = 50): Promise<School[]> => {
  const response = await fetch(`${API_URL}/schools/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  if (!response.ok) {
    throw new Error("Failed to fetch nearby schools");
  }
  const data: any[] = await response.json();
  return data.map((school) => {
    const rawImages = school.image_urls;
    const image_urls =
      rawImages && typeof rawImages === "string"
        ? JSON.parse(rawImages).map((url: string) =>
            url.startsWith("http") ? url : `${BASE_URL}${url}`
          )
        : Array.isArray(rawImages)
          ? rawImages.map((url: string) =>
              url.startsWith("http") ? url : `${BASE_URL}${url}`
            )
          : [];

    const rating_total = school.rating_total ?? 0;
    const rating_count = school.rating_count ?? 0;
    const average_rating =
      rating_count > 0 ? rating_total / rating_count : 0;

    return {
      ...school,
      nameRw: school.name_rw || school.nameRw || "",
      image_urls,
      rating_total,
      rating_count,
      average_rating,
    } as School;
  });
};

export const addSchool = async (schoolData: Omit<School, "id">, images: File[]): Promise<School> => {
  const formData = new FormData();
  Object.entries(schoolData).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  images.forEach((file) => {
    formData.append("images", file);
  });

  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/schools`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to add school");
  }
  return response.json();
};

export const updateSchool = async (
  id: string,
  schoolData: Omit<School, "id">,
  images: File[],
  imagesToDelete: string[]
): Promise<School> => {
  const formData = new FormData();
  Object.entries(schoolData).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  images.forEach((file) => {
    formData.append("images", file);
  });
  imagesToDelete.forEach((url) => {
    formData.append("imagesToDelete", url);
  });

  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/schools/${id}`, {
    method: "PUT",
    headers,
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to update school");
  }
  return response.json();
};

export const deleteSchool = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/schools/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    throw new Error("Failed to delete school");
  }
};

export const rateSchool = async (id: string, rating: number) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/schools/${id}/rate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ rating }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to rate school");
  }
  return response.json();
};

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