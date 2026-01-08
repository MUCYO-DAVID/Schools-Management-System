const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export interface StudentApplication {
  id: number;
  user_id: number;
  school_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  current_grade?: string;
  desired_grade?: string;
  previous_school?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  address?: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
  school_name?: string;
  school_location?: string;
  school_type?: string;
  school_level?: string;
}

export interface ApplicationFormData {
  school_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  current_grade?: string;
  desired_grade?: string;
  previous_school?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  address?: string;
  additional_info?: string;
}

export async function getStudentApplications(): Promise<StudentApplication[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}/api/student/applications`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }

  return response.json();
}

export async function getApplicationById(id: number): Promise<StudentApplication> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}/api/student/applications/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch application');
  }

  return response.json();
}

export async function createApplication(data: ApplicationFormData): Promise<StudentApplication> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}/api/student/applications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit application');
  }

  return response.json();
}

export async function updateApplication(id: number, data: Partial<ApplicationFormData>): Promise<StudentApplication> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}/api/student/applications/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to update application');
  }

  return response.json();
}

export async function withdrawApplication(id: number): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}/api/student/applications/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to withdraw application');
  }
}
