"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Users,
  School,
  BookOpen,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Settings,
} from "lucide-react"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { useAuth } from "../providers/AuthProvider"
import { cn } from "../utils/cn"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  submenu?: NavItem[]
}

const AdminDashboardModern = () => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [loading, setLoading] = useState(true)

  // Placeholder data for charts
  const schoolData = [
    { month: "Jan", schools: 45, students: 1200 },
    { month: "Feb", schools: 52, students: 1400 },
    { month: "Mar", schools: 58, students: 1650 },
    { month: "Apr", schools: 65, students: 1900 },
    { month: "May", schools: 72, students: 2100 },
    { month: "Jun", schools: 78, students: 2350 },
  ]

  const stats = [
    {
      label: "Total Schools",
      value: "156",
      change: "+12%",
      icon: School,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Total Students",
      value: "12,458",
      change: "+8%",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Active Classes",
      value: "324",
      change: "+5%",
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Revenue",
      value: "RWF 2.4M",
      change: "+15%",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.role !== "admin") {
      router.push("/dashboard")
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user, router])

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/admin/dashboard-modern",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      label: "Schools",
      href: "/admin/schools",
      icon: <School className="h-5 w-5" />,
      badge: 5,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Classes",
      href: "/admin/classes",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "Payments",
      href: "/admin/payments",
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  return (
    <DashboardLayout
      navItems={navItems}
      user={{
        name: user?.firstName || "Admin",
        email: user?.email || "admin@example.com",
        initials: (user?.firstName?.[0] || "A") + (user?.lastName?.[0] || ""),
      }}
      notifications={3}
      onLogout={() => {
        logout()
        router.push("/auth/login")
      }}
      onNavigate={(href) => router.push(href)}
      searchPlaceholder="Search schools, students, teachers..."
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.firstName}! Here's your system overview.</p>
          </div>
          <Button
            variant="default"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                      <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                    </div>
                    <div className={cn("p-3 rounded-lg bg-gradient-to-br", stat.color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Growth Trend</CardTitle>
              <CardDescription>Schools and students registration over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={schoolData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="schools"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Schools"
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    name="Students"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "New school registered", time: "2 hours ago" },
                  { label: "50 students enrolled", time: "5 hours ago" },
                  { label: "Payment received", time: "1 day ago" },
                ].map((activity, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{activity.label}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add School
              </Button>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboardModern
