const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export interface SurveyQuestion {
  id?: number;
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'single_choice' | 'rating' | 'yes_no';
  options?: string[];
  is_required?: boolean;
  order_index?: number;
}

export interface SurveyTemplate {
  id: number;
  title: string;
  description?: string;
  school_id?: string;
  school_name?: string;
  created_by?: number;
  creator_first_name?: string;
  creator_last_name?: string;
  audience_role: string;
  status: 'draft' | 'active' | 'closed';
  start_date?: string;
  end_date?: string;
  response_count?: number;
  question_count?: number;
  questions?: SurveyQuestion[];
  has_responded?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SurveyResponse {
  question_id: number;
  answer_text?: string;
  answer_value?: string | string[];
}

// Get all survey templates
export async function fetchSurveyTemplates(filters: {
  school_id?: string;
  status?: string;
  audience_role?: string;
} = {}) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const res = await fetch(`${backendUrl}/api/survey-templates?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch survey templates');
  return res.json();
}

// Get single survey template with questions
export async function fetchSurveyTemplate(id: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/survey-templates/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch survey template');
  return res.json();
}

// Create survey template
export async function createSurveyTemplate(data: {
  title: string;
  description?: string;
  school_id?: string;
  audience_role?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  questions: SurveyQuestion[];
}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/survey-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create survey template');
  }
  return res.json();
}

// Update survey template
export async function updateSurveyTemplate(id: number, data: Partial<{
  title: string;
  description: string;
  school_id: string;
  audience_role: string;
  status: string;
  start_date: string;
  end_date: string;
  questions: SurveyQuestion[];
}>) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/survey-templates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update survey template');
  }
  return res.json();
}

// Delete survey template
export async function deleteSurveyTemplate(id: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/survey-templates/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete survey template');
  }
  return res.json();
}

// Submit survey response
export async function submitSurveyResponse(surveyId: number, answers: SurveyResponse[]) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/survey-templates/${surveyId}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to submit survey response');
  }
  return res.json();
}

// Get survey analytics
export async function fetchSurveyAnalytics(id: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/survey-templates/${id}/analytics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch survey analytics');
  return res.json();
}
