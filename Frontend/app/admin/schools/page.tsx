'use client';

import React, { useState, useEffect } from 'react';
import { School, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/design-system/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/card';
import { Input } from '@/components/design-system/input';
import { Badge } from '@/components/design-system/badge';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function SchoolsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const sidebarLinks = [
    { label: 'Overview', href: '/admin/dashboard', icon: <School size={20} /> },
    { label: 'Schools', href: '/admin/schools', icon: <School size={20} /> },
    { label: 'Users', href: '/admin/users', icon: <School size={20} /> },
  ];

  useEffect(() => {
    // Fetch schools - placeholder
    setSchools([
      {
        id: 1,
        name: 'Kigali Central School',
        location: 'Kigali',
        students: 450,
        staff: 35,
        status: 'Active',
      },
      {
        id: 2,
        name: 'Rural Academy',
        location: 'Muhanga',
        students: 280,
        staff: 22,
        status: 'Active',
      },
      {
        id: 3,
        name: 'Tech Institute',
        location: 'Kigali',
        students: 120,
        staff: 18,
        status: 'Pending',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout sidebarLinks={sidebarLinks} breadcrumbs={[{ label: 'Schools' }]}>
      <PageHeader
        title="Schools Management"
        description="Manage all registered schools"
        action={
          <Button>
            <Plus size={18} className="mr-2" />
            Add School
          </Button>
        }
      />

      <div className="p-6">
        {/* Search bar */}
        <div className="mb-6">
          <Input
            placeholder="Search schools by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>

        {/* Schools table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading schools...</div>
            ) : filteredSchools.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No schools found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                        School Name
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                        Location
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                        Students
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                        Staff
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
                    {filteredSchools.map((school) => (
                      <tr key={school.id} className="border-b border-border hover:bg-slate-50 dark:hover:bg-slate-900">
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {school.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {school.location}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {school.students}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {school.staff}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge
                            variant={school.status === 'Active' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {school.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon-sm">
                              <Eye size={16} />
                            </Button>
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
