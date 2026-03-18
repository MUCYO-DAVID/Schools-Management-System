"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { BookOpen, Clock, CheckCircle, AlertCircle, Star, Calendar, MessageSquare, Download } from "lucide-react"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import { Progress } from "../components/ui/Progress"
import { useAuth } from "../providers/AuthProvider"

interface Assignment {
  id: number
  title: string
  course: string
  dueDate: string
  status: "submitted" | "pending" | "graded" | "overdue"
  score?: number
}

interface Course {
  id: number
  name: string
  teacher: string
  grade: number
  attendance: number
}

interface SkillData {
  skill: string
  score: number
}

const StudentDashboard = () => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [loading, setLoading] = useState(true)

  // Mock data
  const courses: Course[] = [
    {
      id: 1,
      name: "Mathematics",
      teacher: "Mr. Jean Paul",
      grade: 85,
      attendance: 95,
    },
    {
      id: 2,
      name: "English Language",
      teacher: "Ms. Marie",
      grade: 78,
      attendance: 92,
    },
    {
      id: 3,
      name: "Physics",
      teacher: "Mr. Emmanuel",
      grade: 82,
      attendance: 98,
    },
    {
      id: 4,
      name: "Chemistry",
      teacher: "Ms. Grace",
      grade: 88,
      attendance: 94,
    },
  ]

  const assignments: Assignment[] = [
    {
      id: 1,
      title: "Algebra Assignment",
      course: "Mathematics",
      dueDate: "2024-03-25",
      status: "submitted",
      score: 92,
    },
    {
      id: 2,
      title: "Essay on Shakespeare",
      course: "English Language",
      dueDate: "2024-03-22",
      status: "graded",
      score: 78,
    },
    {
      id: 3,
      title: "Physics Lab Report",
      course: "Physics",
      dueDate: "2024-03-28",
      status: "pending",
    },
    {
      id: 4,
      title: "Chemistry Exam",
      course: "Chemistry",
      dueDate: "2024-03-20",
      status: "overdue",
    },
  ]

  const gradeProgress = [
    { month: "Jan", average: 80 },
    { month: "Feb", average: 82 },
    { month: "Mar", average: 85 },
    { month: "Apr", average: 84 },
    { month: "May", average: 86 },
  ]

  const skillsData: SkillData[] = [
    { skill: "Problem Solving", score: 85 },
    { skill: "Critical Thinking", score: 78 },
    { skill: "Communication", score: 82 },
    { skill: "Teamwork", score: 88 },
    { skill: "Time Management", score: 75 },
    { skill: "Creativity", score: 90 },
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login-modern")
    } else if (user?.role !== "student") {
      router.push("/dashboard")
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user, router])

  const navItems = [
    {
      label: "Dashboard",
      href: "/student/dashboard-modern",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "Courses",
      href: "/student/courses",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      label: "Assignments",
      href: "/student/assignments",
      icon: <Clock className="h-5 w-5" />,
      badge: 1,
    },
    {
      label: "Grades",
      href: "/student/grades",
      icon: <Star className="h-5 w-5" />,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  const overallGrade = Math.round(courses.reduce((sum, c) => sum + c.grade, 0) / courses.length)
  const overallAttendance = Math.round(
    courses.reduce((sum, c) => sum + c.attendance, 0) / courses.length
  )

  return (
    <DashboardLayout
      navItems={navItems}
      user={{
        name: user?.firstName || "Student",
        email: user?.email || "student@example.com",
        initials: (user?.firstName?.[0] || "S") + (user?.lastName?.[0] || ""),
      }}
      notifications={2}
      onLogout={() => {
        logout()
        router.push("/auth/login-modern")
      }}
      onNavigate={(href) => router.push(href)}
      searchPlaceholder="Search courses, assignments, or grades..."
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Class: Senior 3A · Registration: STU-2024-001
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall GPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">{overallGrade}%</div>
                  <p className="text-xs text-green-600 mt-1">Excellent</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">{overallAttendance}%</div>
                  <p className="text-xs text-green-600 mt-1">Very Good</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {assignments.filter((a) => a.status === "pending" || a.status === "overdue").length}
                  </div>
                  <p className="text-xs text-orange-600 mt-1">1 overdue</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {assignments.filter((a) => a.status === "graded" || a.status === "submitted").length}
                  </div>
                  <p className="text-xs text-green-600 mt-1">This term</p>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grade Progress */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Grade Progress</CardTitle>
              <CardDescription>Your average grade trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gradeProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[70, 90]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Average Grade"
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skills Radar */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Skills Assessment</CardTitle>
              <CardDescription>Your skill scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={skillsData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Courses */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Current courses and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{course.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Taught by {course.teacher}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{course.grade}%</p>
                      <p className="text-xs text-muted-foreground">Grade</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Current Performance</span>
                        <span className="font-medium text-foreground">{course.grade}%</span>
                      </div>
                      <Progress value={course.grade} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Attendance</span>
                        <span className="font-medium text-foreground">{course.attendance}%</span>
                      </div>
                      <Progress value={course.attendance} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>Your upcoming and recent submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.course} · Due{" "}
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {assignment.score && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {assignment.score}%
                        </p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    )}
                    <Badge
                      variant={
                        assignment.status === "graded"
                          ? "success"
                          : assignment.status === "submitted"
                          ? "info"
                          : assignment.status === "overdue"
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1)}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
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

export default StudentDashboard
