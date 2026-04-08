export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop';
  }

  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Use the same production fallback as other components for consistency
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://rwandaschoolsbridgesystem.onrender.com";
  
  // Clean up potential double slashes and ensure static path is correct
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const cleanBase = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
  
  return `${cleanBase}/${cleanPath}`;
};
