'use client';

import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Trash2, Mail, Phone } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/design-system/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/card';
import { Input } from '@/components/design-system/input';
import { Badge } from '@/components/design-system/badge';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

const roleColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  admin: 'default',
  teacher: 'success',
  student: 'info',
  parent: 'warning',
  leader: 'danger',
};

export default function UsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Jean Marie',
      email: 'jean@example.com',
      phone: '+250781234567',
      role: 'admin',
      school: 'System Admin',
      status: 'Active',
      joinDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Alice Umurerwa',
      email: 'alice@example.com',
      phone: '+250782345678',
      role: 'teacher',
      school: 'Kigali Central',
      status: 'Active',
      joinDate: '2024-02-10',
    },
    {
      id: 3,
      name: 'Robert Mutua',
      email: 'robert@example.com',
      phone: '+250783456789',
      role: 'student',
      school: 'Kigali Central',
      status: 'Active',
      joinDate: '2024-03-05',
    },
    {
      id: 4,
      name: 'Maria Nyirahabimana',
      email: 'maria@example.com',
      phone: '+250784567890',
      role: 'parent',
      school: 'Rural Academy',
      status: 'Inactive',
      joinDate: '2024-01-20',
    },
  ]);

  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const sidebarLinks = [
    { label: 'Overview', href: '/admin/dashboard', icon: <Users size={20} /> },
    { label: 'Schools', href: '/admin/schools', icon: <Users size={20} /> },
    { label: 'Users', href: '/admin/users', icon: <Users size={20} /> },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <AppLayout sidebarLinks={sidebarLinks} breadcrumbs={[{ label: 'Users' }]}>
      <PageHeader
        title="Users Management"
        description="Manage all system users"
        action={
          <Button>
            <Plus size={18} className="mr-2" />
            Add User
          </Button>
        }
      />

      <div className="p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-10 rounded-lg border border-input bg-input px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="leader">Leader</option>
          </select>
        </div>

        {/* Users table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-slate-50 dark:bg-slate-900">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      Name
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      Role
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      School
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <a href={`mailto:${u.email}`} className="hover:text-primary">
                          {u.email}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={roleColors[u.role]} size="sm">
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{u.school}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={u.status === 'Active' ? 'success' : 'outline'}
                          size="sm"
                        >
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon-sm">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="text-danger">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
