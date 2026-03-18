'use client'

import React, { useEffect, useState } from 'react'
import { Users, School, DollarSign, TrendingUp, Calendar, FileText } from 'lucide-react'
import StatCard from './StatCard'
import DataTable, { Column } from './DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export interface AdminDashboardOverviewProps {
  onTabChange?: (tab: string) => void
}

interface RecentActivity {
  id: number
  action: string
  user: string
  timestamp: string
}

export default function AdminDashboardOverview({ onTabChange }: AdminDashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    activeTeachers: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockData = {
      totalSchools: 156,
      totalStudents: 12450,
      activeTeachers: 842,
      totalRevenue: 45230000,
      pendingApprovals: 23,
    }

    const mockActivities = [
      {
        id: 1,
        action: 'New school registered',
        user: 'Admin',
        timestamp: '2 hours ago',
      },
      {
        id: 2,
        action: 'Student enrollment',
        user: 'Teacher - John Doe',
        timestamp: '4 hours ago',
      },
      {
        id: 3,
        action: 'Payment received',
        user: 'Parent - Jane Smith',
        timestamp: '1 day ago',
      },
      {
        id: 4,
        action: 'Teacher verified',
        user: 'Admin',
        timestamp: '2 days ago',
      },
    ]

    setStats(mockData)
    setRecentActivities(mockActivities)
    setIsLoading(false)
  }, [])

  const activityColumns: Column<RecentActivity>[] = [
    {
      key: 'action',
      label: 'Action',
      width: '40%',
    },
    {
      key: 'user',
      label: 'User',
      width: '30%',
    },
    {
      key: 'timestamp',
      label: 'Time',
      width: '30%',
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Key Stats */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your system overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Schools"
            value={stats.totalSchools}
            icon={<School />}
            trend="up"
            trendValue="+12%"
            onClick={() => onTabChange?.('schools')}
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            icon={<Users />}
            trend="up"
            trendValue="+8%"
            onClick={() => onTabChange?.('users')}
          />
          <StatCard
            title="Active Teachers"
            value={stats.activeTeachers}
            icon={<TrendingUp />}
            trend="up"
            trendValue="+5%"
          />
          <StatCard
            title="Total Revenue"
            value={`RWF ${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            icon={<DollarSign />}
            trend="up"
            trendValue="+23%"
            onClick={() => onTabChange?.('payments')}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<Calendar />}
            description="Needs review"
            onClick={() => onTabChange?.('users')}
          />
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Recent Activities</h3>
        <DataTable
          columns={activityColumns}
          data={recentActivities}
          isLoading={isLoading}
          emptyMessage="No recent activities"
        />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={<School className="w-6 h-6" />}
            title="Add School"
            description="Register a new school"
            onClick={() => onTabChange?.('schools')}
          />
          <QuickActionCard
            icon={<Users className="w-6 h-6" />}
            title="Manage Users"
            description="Add or edit users"
            onClick={() => onTabChange?.('users')}
          />
          <QuickActionCard
            icon={<FileText className="w-6 h-6" />}
            title="View Reports"
            description="See system reports"
            onClick={() => onTabChange?.('reports')}
          />
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Card hoverable onClick={onClick} className="cursor-pointer">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">{icon}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
