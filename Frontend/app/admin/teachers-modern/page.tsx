'use client'

import React, { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Download, Award } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { useRouter } from 'next/navigation'

interface Teacher {
  id: number
  firstName: string
  lastName: string
  email: string
  subject: string
  phone: string
  qualification: string
  yearsExperience: number
  status: 'active' | 'inactive' | 'onleave'
  classes: number
  students: number
  performanceRating: number
}

const TeachersModernPage = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'onleave'>('all')

  // Mock data
  const [teachers] = useState<Teacher[]>([
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'Paul Mukandoli',
      email: 'jp.mukandoli@school.com',
      subject: 'Mathematics',
      phone: '+250 788 123 456',
      qualification: 'Bachelor of Science',
      yearsExperience: 8,
      status: 'active',
      classes: 3,
      students: 105,
      performanceRating: 4.8,
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Nyinaweza',
      email: 'marie.nyinaweza@school.com',
      subject: 'English',
      phone: '+250 788 234 567',
      qualification: 'Master of Arts',
      yearsExperience: 6,
      status: 'active',
      classes: 2,
      students: 68,
      performanceRating: 4.6,
    },
    {
      id: 3,
      firstName: 'Emmanuel',
      lastName: 'Habimana',
      email: 'e.habimana@school.com',
      subject: 'Physics',
      phone: '+250 788 345 678',
      qualification: 'Bachelor of Science',
      yearsExperience: 5,
      status: 'active',
      classes: 2,
      students: 64,
      performanceRating: 4.4,
    },
    {
      id: 4,
      firstName: 'Grace',
      lastName: 'Mutesi',
      email: 'grace.mutesi@school.com',
      subject: 'Chemistry',
      phone: '+250 788 456 789',
      qualification: 'Bachelor of Science',
      yearsExperience: 4,
      status: 'inactive',
      classes: 0,
      students: 0,
      performanceRating: 0,
    },
    {
      id: 5,
      firstName: 'Peter',
      lastName: 'Uwimana',
      email: 'p.uwimana@school.com',
      subject: 'Biology',
      phone: '+250 788 567 890',
      qualification: 'Bachelor of Science',
      yearsExperience: 10,
      status: 'active',
      classes: 3,
      students: 98,
      performanceRating: 4.9,
    },
  ])

  const subjects = ['all', ...new Set(teachers.map((t) => t.subject))]

  const filteredTeachers = teachers
    .filter((teacher) => {
      const matchesSearch =
        teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesSubject = filterSubject === 'all' || teacher.subject === filterSubject
      const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus

      return matchesSearch && matchesSubject && matchesStatus
    })
    .sort((a, b) => b.performanceRating - a.performanceRating)

  const getStatusColor = (status: Teacher['status']) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'warning'
      case 'onleave':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.0) return 'text-orange-600'
    return 'text-red-600'
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
      searchPlaceholder="Search teachers..."
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teachers</h1>
            <p className="text-muted-foreground mt-1">Manage {teachers.length} faculty members</p>
          </div>
          <Button className="gap-2" onClick={() => router.push('/admin/teachers-modern/add')}>
            <Plus className="h-4 w-4" />
            Add Teacher
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{teachers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Faculty members</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {teachers.filter((t) => t.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently teaching</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {teachers.reduce((sum, t) => sum + t.classes, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Being taught</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {(
                  teachers
                    .filter((t) => t.performanceRating > 0)
                    .reduce((sum, t) => sum + t.performanceRating, 0) /
                  teachers.filter((t) => t.performanceRating > 0).length
                ).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Performance rating</p>
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
                  placeholder="Search by name, subject, or email..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="h-10 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject === 'all' ? 'All Subjects' : subject}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="onleave">On Leave</option>
                </select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredTeachers.length} of {teachers.length} teachers
            </p>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">
                        {teacher.firstName} {teacher.lastName}
                      </TableCell>
                      <TableCell className="text-sm">{teacher.subject}</TableCell>
                      <TableCell className="text-sm">{teacher.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {teacher.qualification}
                      </TableCell>
                      <TableCell className="text-sm">{teacher.yearsExperience} years</TableCell>
                      <TableCell className="text-sm font-medium">{teacher.classes}</TableCell>
                      <TableCell className="text-sm">{teacher.students}</TableCell>
                      <TableCell>
                        {teacher.performanceRating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className={`font-medium ${getRatingColor(teacher.performanceRating)}`}>
                              {teacher.performanceRating.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(teacher.status)}>
                          {teacher.status.charAt(0).toUpperCase() +
                            teacher.status.slice(1).replace(/([A-Z])/g, ' $1')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              router.push(`/admin/teachers-modern/${teacher.id}`)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              router.push(`/admin/teachers-modern/${teacher.id}/edit`)
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this teacher?')) {
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
                    <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                      No teachers found
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

export default TeachersModernPage
