"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreVertical, Download } from "lucide-react"
import { DashboardLayout } from "../components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/Table"
import { Dialog } from "../components/ui/Dialog"
import { EmptyState } from "../components/ui/EmptyState"
import { useAuth } from "../providers/AuthProvider"
import { cn } from "../utils/cn"

interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
  registrationNumber: string
  schoolName: string
  classLevel: string
  status: "active" | "inactive" | "graduated"
  enrollmentDate: string
}

const StudentsModern = () => {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Mock data - replace with actual API call
  const mockStudents: Student[] = [
    {
      id: 1,
      firstName: "Jean",
      lastName: "Niyigaba",
      email: "jean@school.rw",
      registrationNumber: "STU-2024-001",
      schoolName: "Kigali Secondary School",
      classLevel: "Senior 3",
      status: "active",
      enrollmentDate: "2024-01-15",
    },
    {
      id: 2,
      firstName: "Marie",
      lastName: "Uwamahoro",
      email: "marie@school.rw",
      registrationNumber: "STU-2024-002",
      schoolName: "Kigali Secondary School",
      classLevel: "Senior 2",
      status: "active",
      enrollmentDate: "2024-01-15",
    },
    {
      id: 3,
      firstName: "Emmanuel",
      lastName: "Karake",
      email: "emmanuel@school.rw",
      registrationNumber: "STU-2024-003",
      schoolName: "Muhanga High School",
      classLevel: "Senior 1",
      status: "inactive",
      enrollmentDate: "2024-02-01",
    },
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login-modern")
    } else if (user?.role !== "admin") {
      router.push("/dashboard")
    } else {
      setStudents(mockStudents)
      setFilteredStudents(mockStudents)
      setLoading(false)
    }
  }, [isAuthenticated, user, router])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterStudents(query, filterStatus)
  }

  const handleFilterStatus = (status: string) => {
    setFilterStatus(status)
    filterStudents(searchQuery, status)
  }

  const filterStudents = (query: string, status: string) => {
    let filtered = students
    if (query) {
      filtered = filtered.filter(
        (s) =>
          s.firstName.toLowerCase().includes(query.toLowerCase()) ||
          s.lastName.toLowerCase().includes(query.toLowerCase()) ||
          s.email.toLowerCase().includes(query.toLowerCase()) ||
          s.registrationNumber.toLowerCase().includes(query.toLowerCase())
      )
    }
    if (status !== "all") {
      filtered = filtered.filter((s) => s.status === status)
    }
    setFilteredStudents(filtered)
  }

  const statusColors = {
    active: "success",
    inactive: "warning",
    graduated: "info",
  } as const

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard-modern", icon: <span>📊</span> },
    { label: "Students", href: "/admin/students-modern", icon: <span>👥</span> },
    { label: "Teachers", href: "/admin/teachers-modern", icon: <span>👨‍🏫</span> },
    { label: "Schools", href: "/admin/schools", icon: <span>🏫</span> },
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
      notifications={2}
      onLogout={() => {
        logout()
        router.push("/auth/login-modern")
      }}
      onNavigate={(href) => router.push(href)}
      searchPlaceholder="Search students by name, email, or ID..."
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all student records
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 min-w-0">
                <Input
                  placeholder="Search by name, email, or registration number..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        {filteredStudents.length > 0 ? (
          <Card className="border-0 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead className="hidden md:table-cell">School</TableHead>
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{student.registrationNumber}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {student.schoolName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {student.classLevel}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={statusColors[student.status]}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => alert(`Delete ${student.firstName}`)}
                          className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <EmptyState
              title="No students found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
          </Card>
        )}

        {/* Stats Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold text-foreground mt-2">{students.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active Students</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {students.filter((s) => s.status === "active").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Graduated</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {students.filter((s) => s.status === "graduated").length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Student Dialog */}
      <Dialog
        open={showAddDialog || selectedStudent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false)
            setSelectedStudent(null)
          }
        }}
        title={selectedStudent ? "Edit Student" : "Add New Student"}
        description="Fill in the details below to create or update a student record"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" placeholder="Jean" />
            <Input label="Last Name" placeholder="Niyigaba" />
          </div>
          <Input label="Email" type="email" placeholder="jean@school.rw" />
          <Input label="Registration Number" placeholder="STU-2024-001" />
          <select className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
            <option>Select School</option>
            <option>Kigali Secondary School</option>
            <option>Muhanga High School</option>
          </select>
          <select className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
            <option>Select Class</option>
            <option>Senior 1</option>
            <option>Senior 2</option>
            <option>Senior 3</option>
          </select>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false)
                setSelectedStudent(null)
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1">
              {selectedStudent ? "Update Student" : "Create Student"}
            </Button>
          </div>
        </form>
      </Dialog>
    </DashboardLayout>
  )
}

export default StudentsModern
