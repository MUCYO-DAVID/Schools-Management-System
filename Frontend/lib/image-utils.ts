import { BACKEND_URL } from "@/lib/backend";

export const SCHOOL_PLACEHOLDER = "/placeholder.jpg";

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath || imagePath === "null" || imagePath === "undefined") {
    return SCHOOL_PLACEHOLDER;
  }

  const trimmed = String(imagePath).trim();
  if (!trimmed) return SCHOOL_PLACEHOLDER;

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
