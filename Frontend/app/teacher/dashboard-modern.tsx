"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar, Users, BookOpen, ClipboardList, TrendingUp, Plus, MessageSquare, Clock } from "lucide-react"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { useAuth } from "../providers/AuthProvider"
import { cn } from "../utils/cn"

interface Class {
  id: number
  name: string
  students: number
  subject: string
  level: string
}

interface Assignment {
  id: number
  title: string
  dueDate: string
  submitted: number
  total: number
  status: "pending" | "in-review" | "completed"
}

interface StudentPerformance {
  name: string
  score: number
}

const TeacherDashboard = () => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [loading, setLoading] = useState(true)

  // Mock data
  const classes: Class[] = [
    {
      id: 1,
      name: "Senior 3A",
      students: 35,
      subject: "Mathematics",
      level: "Senior 3",
    },
    {
      id: 2,
      name: "Senior 3B",
      students: 32,
      subject: "Mathematics",
      level: "Senior 3",
    },
    {
      id: 3,
      name: "Senior 2A",
      students: 38,
      subject: "Mathematics",
      level: "Senior 2",
    },
  ]

  const assignments: Assignment[] = [
    {
      id: 1,
      title: "Algebra Assignment 1",
      dueDate: "2024-03-25",
      submitted: 28,
      total: 35,
      status: "in-review",
    },
    {
      id: 2,
      title: "Geometry Problem Set",
      dueDate: "2024-03-22",
      submitted: 33,
      total: 35,
      status: "completed",
    },
    {
      id: 3,
      title: "Calculus Exam",
      dueDate: "2024-03-28",
      submitted: 0,
      total: 32,
      status: "pending",
    },
  ]

  const performanceData: StudentPerformance[] = [
    { name: "Jean", score: 85 },
    { name: "Marie", score: 92 },
    { name: "Emmanuel", score: 78 },
    { name: "Grace", score: 88 },
    { name: "Peter", score: 95 },
  ]

  const classDistribution = [
    { name: "Senior 3A", value: 35 },
    { name: "Senior 3B", value: 32 },
    { name: "Senior 2A", value: 38 },
  ]

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B"]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login-modern")
    } else if (user?.role !== "teacher") {
      router.push("/dashboard")
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user, router])

  const navItems = [
    {
      label: "Dashboard",
      href: "/teacher/dashboard-modern",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      label: "Classes",
      href: "/teacher/classes",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Assignments",
      href: "/teacher/assignments",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      label: "Messages",
      href: "/teacher/messages",
      icon: <MessageSquare className="h-5 w-5" />,
      badge: 3,
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
        name: user?.firstName || "Teacher",
        email: user?.email || "teacher@example.com",
        initials: (user?.firstName?.[0] || "T") + (user?.lastName?.[0] || ""),
      }}
      notifications={3}
      onLogout={() => {
        logout()
        router.push("/auth/login-modern")
      }}
      onNavigate={(href) => router.push(href)}
      searchPlaceholder="Search classes, assignments, or students..."
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.firstName}!</h1>
            <p className="text-muted-foreground mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Button className="gap-2" onClick={() => router.push("/teacher/assignments?action=create")}>
            <Plus className="h-4 w-4" />
            New Assignment
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">105</div>
                  <p className="text-xs text-green-600 mt-1">Across 3 classes</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">3</div>
                  <p className="text-xs text-orange-600 mt-1">1 pending review</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Submissions Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">28</div>
                  <p className="text-xs text-green-600 mt-1">+15% from yesterday</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Classes Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">2</div>
                  <p className="text-xs text-blue-600 mt-1">Next in 45 minutes</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes Overview */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>My Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
                  >
                    <p className="font-medium text-foreground">{cls.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cls.subject} · {cls.students} students
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${(cls.students / 40) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{cls.students}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Class Distribution Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={classDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Submissions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Assignment Submissions</CardTitle>
                <CardDescription>Submission rate across assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={assignments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="submitted" stackId="a" fill="hsl(var(--primary))" name="Submitted" />
                    <Bar
                      dataKey="total"
                      stackId="a"
                      fill="hsl(var(--muted))"
                      name="Total"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Performance */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Highest scoring students this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={performanceData}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pending Assignments */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Assignments to Grade</CardTitle>
            <CardDescription>Assignments awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assignment.submitted} of {assignment.total} submitted
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {Math.round((assignment.submitted / assignment.total) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        assignment.status === "completed"
                          ? "success"
                          : assignment.status === "in-review"
                          ? "warning"
                          : "outline"
                      }
                    >
                      {assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1).replace("-", " ")}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default TeacherDashboard
