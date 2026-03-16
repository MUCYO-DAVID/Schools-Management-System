const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function fetchGalleries(filters: {
  school_id?: string;
  gallery_type?: string;
  is_featured?: boolean;
} = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });

  const res = await fetch(`${backendUrl}/api/galleries?${params}`);
  if (!res.ok) throw new Error("Failed to fetch galleries");
  return res.json();
}

export async function fetchGallery(id: number) {
  const res = await fetch(`${backendUrl}/api/galleries/${id}`);
  if (!res.ok) throw new Error("Failed to fetch gallery");
  return res.json();
}

export async function createGallery(galleryData: {
  school_id?: string;
  title: string;
  description?: string;
  gallery_type?: string;
  is_featured?: boolean;
}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/galleries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(galleryData),
  });

  if (!res.ok) throw new Error("Failed to create gallery");
  return res.json();
}

export async function updateGallery(id: number, galleryData: Partial<{
  title: string;
  description: string;
  gallery_type: string;
  is_featured: boolean;
}>) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/galleries/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(galleryData),
  });

  if (!res.ok) throw new Error("Failed to update gallery");
  return res.json();
}

export async function deleteGallery(id: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/galleries/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to delete gallery");
  return res.json();
}

export async function uploadGalleryMedia(galleryId: number, formData: FormData) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/galleries/${galleryId}/items`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload media");
  return res.json();
}

export async function updateGalleryItem(itemId: number, itemData: Partial<{
  title: string;
  description: string;
  order_index: number;
}>) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/gallery-items/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });

  if (!res.ok) throw new Error("Failed to update gallery item");
  return res.json();
}

export async function deleteGalleryItem(itemId: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/gallery-items/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to delete gallery item");
  return res.json();
}
