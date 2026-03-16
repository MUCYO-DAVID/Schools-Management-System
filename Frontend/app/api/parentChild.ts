const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Get all children for a parent
export async function fetchParentChildren(parentId?: number) {
  const token = localStorage.getItem('token');
  const url = parentId 
    ? `${backendUrl}/api/parent-children?parent_id=${parentId}`
    : `${backendUrl}/api/parent-children`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch parent children');
  return res.json();
}

// Get all parents for a child (student)
export async function fetchChildParents(childId?: number) {
  const token = localStorage.getItem('token');
  const url = childId
    ? `${backendUrl}/api/child-parents?child_id=${childId}`
    : `${backendUrl}/api/child-parents`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch child parents');
  return res.json();
}

// Link a parent to a child
export async function linkParentToChild(data: {
  parent_id: number;
  child_id: number;
  relationship_type?: string;
  is_primary?: boolean;
}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/parent-children`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to link parent to child');
  }
  return res.json();
}

// Update relationship
export async function updateParentChildRelationship(
  id: number,
  data: {
    relationship_type?: string;
    is_primary?: boolean;
  }
) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/parent-children/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update relationship');
  return res.json();
}

// Remove relationship
export async function removeParentChildRelationship(id: number) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${backendUrl}/api/parent-children/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to remove relationship');
  return res.json();
}
