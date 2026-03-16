const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function fetchGrades(filters: {
  student_id?: number;
  school_id?: string;
  term?: string;
  academic_year?: string;
  teacher_id?: number;
} = {}) {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });

  const url = filters.student_id
    ? `${backendUrl}/api/grades/student/${filters.student_id}?${params}`
    : `${backendUrl}/api/grades?${params}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch grades");
  return res.json();
}

export async function createGrade(gradeData: {
  student_user_id: number;
  school_id: string;
  subject: string;
  grade: string;
  score?: number;
  max_score?: number;
  term: string;
  academic_year: string;
  comments?: string;
}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/grades`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(gradeData),
  });

  if (!res.ok) throw new Error("Failed to create grade");
  return res.json();
}

export async function updateGrade(id: number, gradeData: Partial<{
  subject: string;
  grade: string;
  score: number;
  max_score: number;
  comments: string;
}>) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/grades/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(gradeData),
  });

  if (!res.ok) throw new Error("Failed to update grade");
  return res.json();
}

export async function deleteGrade(id: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/grades/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to delete grade");
  return res.json();
}

export async function fetchReportCards(studentId: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/report-cards/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch report cards");
  return res.json();
}

export async function generateReportCard(reportData: {
  student_user_id: number;
  school_id: string;
  term: string;
  academic_year: string;
  attendance_percentage?: number;
  teacher_comments?: string;
  principal_comments?: string;
}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${backendUrl}/api/report-cards/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reportData),
  });

  if (!res.ok) throw new Error("Failed to generate report card");
  return res.json();
}
