import { BACKEND_URL } from "@/lib/backend";

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const cleanBase = BACKEND_URL;
  
  return `${cleanBase}/${cleanPath}`;
};
