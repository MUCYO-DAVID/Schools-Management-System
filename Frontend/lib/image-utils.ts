import { BACKEND_URL } from "@/lib/backend";

export const getImageUrl = (imagePath: string | null | undefined): string => {
  const fallback =
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop";

  if (!imagePath || imagePath === "null" || imagePath === "undefined") {
    return fallback;
  }

  const trimmed = String(imagePath).trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const base = BACKEND_URL.replace(/\/$/, "");

  if (!base) {
    return path;
  }

  return `${base}${path}`;
};
