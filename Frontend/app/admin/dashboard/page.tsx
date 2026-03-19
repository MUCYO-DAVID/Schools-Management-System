'use client';

import React, { useState, useEffect } from 'react';
import { Users, School, TrendingUp, Plus, BarChart3, Calendar, FileText } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/design-system/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/card';
import { StatCard } from '@/components/design-system/stat-card';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalUsers: 0,
    activeEvents: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  // Sidebar navigation for admin
  const sidebarLinks = [
    {
      label: 'Overview',
      href: '/admin/dashboard',
      icon: <BarChart3 size={20} />,
    },
    {
      label: 'Schools',
      href: '/admin/schools',
      icon: <School size={20} />,
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: <Users size={20} />,
    },
    {
      label: 'Events',
      href: '/admin/events',
      icon: <Calendar size={20} />,
    },
    {
      label: 'Reports',
      href: '/admin/reports',
      icon: <FileText size={20} />,
    },
  ];

  return (
    <AppLayout sidebarLinks={sidebarLinks} breadcrumbs={[{ label: 'Dashboard' }]}>
      <PageHeader title="Admin Dashboard" description="Manage schools, users, and system resources" />

      {/* Main content */}
      <div className="p-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Schools"
            value="24"
            description="Active schools"
            icon={<School size={24} />}
            trend={{ value: 12, isPositive: true }}
            color="default"
          />
          <StatCard
            title="Users"
            value="1,234"
            description="Total users"
            icon={<Users size={24} />}
            trend={{ value: 8, isPositive: true }}
            color="success"
          />
          <StatCard
            title="Active Events"
            value="12"
            description="This month"
            icon={<Calendar size={24} />}
            trend={{ value: 5, isPositive: true }}
            color="info"
          />
          <StatCard
            title="Pending Applications"
            value="8"
            description="Need review"
            icon={<FileText size={24} />}
            trend={{ value: 2, isPositive: false }}
            color="warning"
          />
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="w-full justify-start">
              <Plus size={18} className="mr-2" />
              Add School
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users size={18} className="mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar size={18} className="mr-2" />
              Create Event
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 size={18} className="mr-2" />
              View Reports
            </Button>
          </div>
        </div>

        {/* Recent activity section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          School registration updated
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System status */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API Status</span>
                    <span className="text-xs font-medium text-success">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Database</span>
                    <span className="text-xs font-medium text-success">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email Service</span>
                    <span className="text-xs font-medium text-warning">Degraded</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Storage</span>
                    <span className="text-xs font-medium text-success">Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
