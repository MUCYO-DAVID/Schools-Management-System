'use client'

import React, { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Download, Filter, ChevronDown } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { useRouter } from 'next/navigation'

interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
  registrationNumber: string
  class: string
  parentName: string
  parentPhone: string
  status: 'active' | 'inactive' | 'suspended'
  enrollmentDate: string
  grade?: number
}

const StudentsModernPage = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'enrollment' | 'class'>('name')

  // Mock data
  const [students] = useState<Student[]>([
    {
      id: 1,
      firstName: 'Emmanuel',
      lastName: 'Niyigaba',
      email: 'emmanuel.niyigaba@example.com',
      registrationNumber: 'STU-2024-001',
      class: 'Senior 3A',
      parentName: 'Jean Niyigaba',
      parentPhone: '+250 788 123 456',
      status: 'active',
      enrollmentDate: '2024-01-15',
      grade: 85,
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Umwali',
      email: 'marie.umwali@example.com',
      registrationNumber: 'STU-2024-002',
      class: 'Senior 3B',
      parentName: 'Grace Umwali',
      parentPhone: '+250 788 234 567',
      status: 'active',
      enrollmentDate: '2024-01-16',
      grade: 92,
    },
    {
      id: 3,
      firstName: 'Jean Paul',
      lastName: 'Mugisha',
      email: 'jeanpaul.mugisha@example.com',
      registrationNumber: 'STU-2024-003',
      class: 'Senior 2A',
      parentName: 'Paul Mugisha',
      parentPhone: '+250 788 345 678',
      status: 'active',
      enrollmentDate: '2024-01-17',
      grade: 78,
    },
    {
      id: 4,
      firstName: 'Grace',
      lastName: 'Uwase',
      email: 'grace.uwase@example.com',
      registrationNumber: 'STU-2024-004',
      class: 'Senior 3A',
      parentName: 'Uwase Family',
      parentPhone: '+250 788 456 789',
      status: 'inactive',
      enrollmentDate: '2024-02-01',
      grade: 0,
    },
    {
      id: 5,
      firstName: 'Peter',
      lastName: 'Habimana',
      email: 'peter.habimana@example.com',
      registrationNumber: 'STU-2024-005',
      class: 'Senior 3B',
      parentName: 'Habimana Family',
      parentPhone: '+250 788 567 890',
      status: 'active',
      enrollmentDate: '2024-01-20',
      grade: 88,
    },
  ])

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === 'all' || student.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.firstName.localeCompare(b.firstName)
      } else if (sortBy === 'enrollment') {
        return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime()
      } else if (sortBy === 'class') {
        return a.class.localeCompare(b.class)
      }
      return 0
    })

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'warning'
      case 'suspended':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard-modern' },
    { label: 'Students', href: '/admin/students-modern' },
    { label: 'Teachers', href: '/admin/teachers-modern' },
    { label: 'Classes', href: '/admin/classes-modern' },
  ]

  return (
    <DashboardLayout
      navItems={navItems}
      user={{
        name: 'Admin User',
        email: 'admin@school.com',
        initials: 'AU',
      }}
      notifications={0}
      onLogout={() => router.push('/auth/login-modern')}
      onNavigate={(href) => router.push(href)}
      searchPlaceholder="Search students..."
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground mt-1">
              Manage {students.length} registered students
            </p>
          </div>
          <Button className="gap-2" onClick={() => router.push('/admin/students-modern/add')}>
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{students.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {students.filter((s) => s.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently enrolled</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {students.filter((s) => s.status === 'inactive').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Not enrolled</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Grade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  students.filter((s) => s.grade! > 0).reduce((sum, s) => sum + s.grade!, 0) /
                    students.filter((s) => s.grade! > 0).length
                )}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Class average</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, email, or registration number..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="h-10 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  className="h-10 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="enrollment">Sort by Enrollment</option>
                  <option value="class">Sort by Class</option>
                </select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Registration #</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.registrationNumber}
                      </TableCell>
                      <TableCell className="text-sm">{student.email}</TableCell>
                      <TableCell className="text-sm">{student.class}</TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{student.parentName}</p>
                          <p className="text-muted-foreground text-xs">{student.parentPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.grade > 0 ? `${student.grade}%` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(student.status)}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(student.enrollmentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              router.push(`/admin/students-modern/${student.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              router.push(`/admin/students-modern/${student.id}/edit`)
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this student?')) {
                                // Handle deletion
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default StudentsModernPage
