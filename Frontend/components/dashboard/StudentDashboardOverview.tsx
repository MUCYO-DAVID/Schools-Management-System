'use client'

import React, { useEffect, useState } from 'react'
import { Award, BookOpen, Calendar, TrendingUp } from 'lucide-react'
import StatCard from './StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export interface StudentDashboardOverviewProps {
  onTabChange?: (tab: string) => void
}

export default function StudentDashboardOverview({ onTabChange }: StudentDashboardOverviewProps) {
  const [stats, setStats] = useState({
    gpa: 3.8,
    attendance: 94,
    assignmentsDue: 3,
    classesEnrolled: 6,
  })
  const [isLoading, setIsLoading] = useState(false)

  const announcements = [
    { id: 1, title: 'Mid-term exams schedule', date: 'Mar 20, 2024' },
    { id: 2, title: 'Campus closure notice', date: 'Mar 15, 2024' },
    { id: 3, title: 'New library resources available', date: 'Mar 10, 2024' },
  ]

  const upcomingEvents = [
    { id: 1, title: 'Mathematics Quiz', date: 'Mar 22, 2024', time: '9:00 AM' },
    { id: 2, title: 'English Assignment Due', date: 'Mar 23, 2024', time: '5:00 PM' },
    { id: 3, title: 'Science Lab Session', date: 'Mar 24, 2024', time: '2:00 PM' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Your Academic Dashboard</h2>
        <p className="text-muted-foreground mt-1">Track your progress and stay updated</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current GPA"
          value={stats.gpa}
          icon={<TrendingUp />}
          trend="up"
          trendValue="+0.2"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendance}%`}
          icon={<Calendar />}
          trend="up"
          trendValue="+3%"
        />
        <StatCard
          title="Assignments Due"
          value={stats.assignmentsDue}
          icon={<BookOpen />}
          description="This week"
        />
        <StatCard
          title="Classes Enrolled"
          value={stats.classesEnrolled}
          icon={<Award />}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <p className="font-medium text-foreground text-sm">{announcement.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{announcement.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.date} at {event.time}
                    </p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { subject: 'Mathematics', grade: 'A', percentage: 92 },
              { subject: 'English', grade: 'A-', percentage: 88 },
              { subject: 'Sciences', grade: 'B+', percentage: 85 },
              { subject: 'History', grade: 'A', percentage: 90 },
              { subject: 'Languages', grade: 'A-', percentage: 87 },
            ].map((item) => (
              <div key={item.subject}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{item.subject}</span>
                  <span className="text-sm font-semibold text-primary">{item.grade}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
