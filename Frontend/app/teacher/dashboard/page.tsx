'use client';

import React, { useEffect } from 'react';
import { Users, BookOpen, Calendar, FileText, CheckCircle } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/design-system/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/card';
import { Badge } from '@/components/design-system/badge';
import { StatCard } from '@/components/design-system/stat-card';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'teacher') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const sidebarLinks = [
    { label: 'Dashboard', href: '/teacher/dashboard', icon: <BookOpen size={20} /> },
    { label: 'My Classes', href: '/teacher/classes', icon: <Users size={20} /> },
    { label: 'Grades', href: '/teacher/grades', icon: <CheckCircle size={20} /> },
    { label: 'Schedule', href: '/teacher/schedule', icon: <Calendar size={20} /> },
    { label: 'Messages', href: '/teacher/messages', icon: <FileText size={20} /> },
  ];

  return (
    <AppLayout sidebarLinks={sidebarLinks} breadcrumbs={[{ label: 'Dashboard' }]}>
      <PageHeader
        title="Teacher Dashboard"
        description="Manage classes, grades, and student progress"
      />

      <div className="p-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="My Classes"
            value="5"
            description="Active classes"
            icon={<Users size={24} />}
            color="default"
          />
          <StatCard
            title="Total Students"
            value="145"
            description="Across all classes"
            icon={<Users size={24} />}
            color="success"
          />
          <StatCard
            title="Pending Grades"
            value="12"
            description="To submit"
            icon={<CheckCircle size={24} />}
            color="warning"
          />
          <StatCard
            title="Assignments"
            value="8"
            description="Active assignments"
            icon={<FileText size={24} />}
            color="info"
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Classes</span>
                  <Button size="sm">Add Class</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Math 101', section: 'Section A', students: 35, time: 'Mon, Wed, Fri' },
                    { name: 'Physics 101', section: 'Section B', students: 28, time: 'Tue, Thu' },
                    { name: 'Chemistry 101', section: 'Section A', students: 32, time: 'Mon, Wed' },
                    { name: 'Biology 101', section: 'Section C', students: 30, time: 'Tue, Thu, Fri' },
                  ].map((cls, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between pb-4 border-b border-border last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cls.section} • {cls.students} students
                        </p>
                        <p className="text-xs text-primary mt-1">{cls.time}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText size={18} className="mr-2" />
                  Enter Grades
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users size={18} className="mr-2" />
                  Create Assignment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar size={18} className="mr-2" />
                  Schedule Exam
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText size={18} className="mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
