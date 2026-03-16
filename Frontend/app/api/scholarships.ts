const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function fetchScholarships(filters: {
  school_id?: string;
  status?: string;
  min_amount?: number;
  max_amount?: number;
} = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });

  const res = await fetch(`${backendUrl}/api/scholarships?${params}`);
  if (!res.ok) throw new Error("Failed to fetch scholarships");
  return res.json();
}

export async function fetchScholarship(id: number) {
  const res = await fetch(`${backendUrl}/api/scholarships/${id}`);
  if (!res.ok) throw new Error("Failed to fetch scholarship");
  return res.json();
}

export async function createScholarship(scholarshipData: {
  school_id?: string;
  title: string;
  description: string;
  amount?: number;
  currency?: string;
  coverage_type?: string;
  eligibility_criteria?: string;
  required_documents?: string;
  application_deadline?: string;
  start_date?: string;
  end_date?: string;
  total_slots?: number;
  status?: string;
}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/scholarships`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(scholarshipData),
  });

  if (!res.ok) throw new Error("Failed to create scholarship");
  return res.json();
}

export async function updateScholarship(id: number, scholarshipData: Partial<{
  title: string;
  description: string;
  amount: number;
  currency: string;
  coverage_type: string;
  eligibility_criteria: string;
  required_documents: string;
  application_deadline: string;
  start_date: string;
  end_date: string;
  total_slots: number;
  remaining_slots: number;
  status: string;
}>) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/scholarships/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(scholarshipData),
  });

  if (!res.ok) throw new Error("Failed to update scholarship");
  return res.json();
}

export async function deleteScholarship(id: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/scholarships/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to delete scholarship");
  return res.json();
}

export async function applyForScholarship(id: number, formData: FormData) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/scholarships/${id}/apply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to apply for scholarship");
  return res.json();
}

export async function fetchMyApplications() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/scholarship-applications/my-applications`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

export async function fetchScholarshipApplications(scholarshipId: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/scholarships/${scholarshipId}/applications`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

export async function reviewApplication(applicationId: number, reviewData: {
  status: 'approved' | 'rejected' | 'pending';
  review_score?: number;
  reviewer_comments?: string;
}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/scholarship-applications/${applicationId}/review`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  if (!res.ok) throw new Error("Failed to review application");
  return res.json();
}
