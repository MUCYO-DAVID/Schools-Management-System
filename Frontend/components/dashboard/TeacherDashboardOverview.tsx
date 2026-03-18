'use client'

import React, { useEffect, useState } from 'react'
import { BookOpen, Users, BarChart3, Clock } from 'lucide-react'
import StatCard from './StatCard'
import DataTable, { Column } from './DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export interface TeacherDashboardOverviewProps {
  onTabChange?: (tab: string) => void
}

interface ClassInfo {
  id: number
  name: string
  students: number
  schedule: string
}

export default function TeacherDashboardOverview({ onTabChange }: TeacherDashboardOverviewProps) {
  const [stats, setStats] = useState({
    classes: 4,
    students: 142,
    assignments: 12,
    attendanceRate: 92,
  })
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const mockClasses = [
      { id: 1, name: 'Grade 10A - Mathematics', students: 35, schedule: 'Mon, Wed, Fri 9:00 AM' },
      { id: 2, name: 'Grade 11A - Mathematics', students: 38, schedule: 'Tue, Thu 10:00 AM' },
      { id: 3, name: 'Grade 12A - Advanced Math', students: 32, schedule: 'Mon, Wed, Fri 2:00 PM' },
      { id: 4, name: 'Grade 10B - Mathematics', students: 37, schedule: 'Tue, Thu 11:00 AM' },
    ]

    setClasses(mockClasses)
    setIsLoading(false)
  }, [])

  const classColumns: Column<ClassInfo>[] = [
    {
      key: 'name',
      label: 'Class',
      width: '40%',
    },
    {
      key: 'students',
      label: 'Students',
      width: '20%',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'schedule',
      label: 'Schedule',
      width: '40%',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Key Stats */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Welcome Back, Teacher</h2>
          <p className="text-muted-foreground mt-1">Here's an overview of your teaching activities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Classes"
            value={stats.classes}
            icon={<BookOpen />}
            description="Active classes"
          />
          <StatCard
            title="Total Students"
            value={stats.students}
            icon={<Users />}
            trend="up"
            trendValue="+5%"
          />
          <StatCard
            title="Pending Assignments"
            value={stats.assignments}
            icon={<BarChart3 />}
            description="To be graded"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<Clock />}
            trend="up"
            trendValue="+2%"
          />
        </div>
      </div>

      {/* My Classes */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">My Classes</h3>
        <DataTable
          columns={classColumns}
          data={classes}
          isLoading={isLoading}
          emptyMessage="No classes assigned"
          onRowClick={() => onTabChange?.('classes')}
        />
      </div>

      {/* Recent Messages */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Recent Messages</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              No new messages
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
