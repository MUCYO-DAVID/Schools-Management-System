'use client'

import React, { useEffect, useState } from 'react'
import { User, TrendingUp, Calendar, MessageCircle } from 'lucide-react'
import StatCard from './StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export interface ParentDashboardOverviewProps {
  onTabChange?: (tab: string) => void
}

export default function ParentDashboardOverview({ onTabChange }: ParentDashboardOverviewProps) {
  const [children, setChildren] = useState([
    { id: 1, name: 'Sarah Johnson', class: 'Grade 10A', school: 'Central High School' },
    { id: 2, name: 'Michael Johnson', class: 'Grade 8B', school: 'Central High School' },
  ])
  const [selectedChild, setSelectedChild] = useState(children[0])
  const [stats, setStats] = useState({
    gpa: 3.8,
    attendance: 94,
    balance: 150000,
  })

  const recentMessages = [
    { id: 1, from: 'Teacher - John Doe', subject: 'Great progress in class', date: 'Today' },
    { id: 2, from: 'School Admin', subject: 'Upcoming sports day', date: 'Yesterday' },
    { id: 3, from: 'Teacher - Jane Smith', subject: 'Assignment feedback', date: '2 days ago' },
  ]

  const paymentHistory = [
    { id: 1, description: 'Tuition Fee - Term 1', amount: 500000, date: 'Mar 1, 2024', status: 'Paid' },
    { id: 2, description: 'Sports Activities', amount: 50000, date: 'Feb 28, 2024', status: 'Paid' },
    { id: 3, description: 'Laboratory Fee', amount: 100000, date: 'Feb 15, 2024', status: 'Pending' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Parent Portal</h2>
        <p className="text-muted-foreground mt-1">Monitor your child's progress and school activities</p>
      </div>

      {/* Child Selection */}
      {children.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3 flex-wrap">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedChild.id === child.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Child Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{selectedChild.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedChild.class}</p>
              <p className="text-sm text-muted-foreground">{selectedChild.school}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <User className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          title="Outstanding Balance"
          value={`RWF ${(stats.balance / 1000).toFixed(0)}K`}
          icon={<MessageCircle />}
          description="Payment due"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Messages from School</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <p className="font-medium text-foreground text-sm">{message.from}</p>
                  <p className="text-xs text-muted-foreground mt-1">{message.subject}</p>
                  <p className="text-xs text-muted-foreground mt-2">{message.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">{payment.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground text-sm">RWF {payment.amount.toLocaleString()}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                        payment.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
