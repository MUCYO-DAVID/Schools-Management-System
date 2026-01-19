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
  document_urls?: string | string[];
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
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
  
  if (!token) {
    console.warn('No token found in localStorage');
    throw new Error('Not authenticated');
  }

  console.log('Fetching applications with token...');
  const response = await fetch(`${BACKEND_URL}/api/student/applications`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const status = response.status;
    console.error('Failed to fetch applications, status:', status);
    
    if (status === 401) {
      throw new Error('Unauthorized - please login again');
    }
    throw new Error(`Failed to fetch applications (${status})`);
  }

  const data = await response.json();
  console.log('Applications received from server:', data);
  return data;
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

export async function createApplication(data: ApplicationFormData, documents?: File[]): Promise<StudentApplication> {
  const token = localStorage.getItem('token');
  
  // Create FormData to handle file uploads
  const formData = new FormData();
  
  // Append all form fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  
  // Append documents if any
  if (documents && documents.length > 0) {
    documents.forEach((file) => {
      formData.append('documents', file);
    });
  }
  
  const response = await fetch(`${BACKEND_URL}/api/student/applications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
    },
    body: formData
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

export interface LeaderApplication extends StudentApplication {
  user_first_name: string;
  user_last_name: string;
  user_email: string;
}

export async function getLeaderApplications(): Promise<LeaderApplication[]> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('No token found in localStorage');
    throw new Error('Not authenticated');
  }

  console.log('Fetching leader applications with token...');
  const response = await fetch(`${BACKEND_URL}/api/student/leader/applications`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const status = response.status;
    console.error('Failed to fetch leader applications, status:', status);
    
    if (status === 401) {
      throw new Error('Unauthorized - please login again');
    }
    if (status === 403) {
      throw new Error('Access denied - leader role required');
    }
    throw new Error(`Failed to fetch applications (${status})`);
  }

  const data = await response.json();
  console.log('Leader applications received from server:', data);
  return data;
}

export async function approveApplication(applicationId: number): Promise<StudentApplication> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}/api/student/leader/applications/${applicationId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to approve application');
  }

  return response.json();
}

export async function rejectApplication(applicationId: number, rejectionReason: string): Promise<StudentApplication> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}/api/student/leader/applications/${applicationId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rejection_reason: rejectionReason })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reject application');
  }

  return response.json();
}
