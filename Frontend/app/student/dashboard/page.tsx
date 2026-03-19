'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Calendar, FileText, Search, MapPin, Users, Star } from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { Button } from '@/components/design-system/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/card';
import { Input } from '@/components/design-system/input';
import { Badge } from '@/components/design-system/badge';
import { StatCard } from '@/components/design-system/stat-card';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  const sidebarLinks = [
    { label: 'Dashboard', href: '/student/dashboard', icon: <GraduationCap size={20} /> },
    { label: 'Browse Schools', href: '/student/schools', icon: <MapPin size={20} /> },
    { label: 'My Applications', href: '/student/applications', icon: <FileText size={20} /> },
    { label: 'Grades', href: '/student/grades', icon: <BookOpen size={20} /> },
    { label: 'Events', href: '/student/events', icon: <Calendar size={20} /> },
  ];

  return (
    <AppLayout sidebarLinks={sidebarLinks} breadcrumbs={[{ label: 'Dashboard' }]}>
      <PageHeader
        title="Welcome, Student"
        description="Your academic portal and school explorer"
      />

      <div className="p-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="My Grade"
            value="3.8"
            description="Current GPA"
            icon={<BookOpen size={24} />}
            color="default"
          />
          <StatCard
            title="Applications"
            value="5"
            description="Schools applied"
            icon={<FileText size={24} />}
            color="info"
          />
          <StatCard
            title="Upcoming Events"
            value="3"
            description="This week"
            icon={<Calendar size={24} />}
            color="success"
          />
          <StatCard
            title="Messages"
            value="2"
            description="New messages"
            icon={<Users size={24} />}
            color="warning"
          />
        </div>

        {/* Main content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { school: 'Kigali Central School', status: 'Accepted', date: '2 days ago' },
                    { school: 'Tech Institute', status: 'Pending', date: '1 week ago' },
                    { school: 'Rural Academy', status: 'Rejected', date: '2 weeks ago' },
                  ].map((app, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between pb-4 border-b border-border last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{app.school}</p>
                        <p className="text-xs text-muted-foreground">{app.date}</p>
                      </div>
                      <Badge
                        variant={
                          app.status === 'Accepted'
                            ? 'success'
                            : app.status === 'Pending'
                              ? 'warning'
                              : 'danger'
                        }
                        size="sm"
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Tech Workshop', date: 'Tomorrow, 2 PM', school: 'Tech Institute' },
                  { name: 'Open Day', date: 'Friday', school: 'Kigali Central' },
                  { name: 'Math Olympiad', date: 'Next Week', school: 'Rural Academy' },
                ].map((event, idx) => (
                  <div key={idx} className="pb-4 border-b border-border last:border-b-0">
                    <p className="text-sm font-medium text-foreground">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                    <p className="text-xs text-primary mt-1">{event.school}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
