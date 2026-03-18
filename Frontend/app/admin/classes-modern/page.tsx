'use client'

import React, { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Download, Users } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table'
import { Progress } from '../../components/ui/Progress'
import { useRouter } from 'next/navigation'

interface Class {
  id: number
  name: string
  level: string
  section: string
  teacher: string
  subject: string
  studentCount: number
  maxCapacity: number
  schedule: string
  room: string
  status: 'active' | 'inactive'
  averageGrade: number
}

const ClassesModernPage = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Mock data
  const [classes] = useState<Class[]>([
    {
      id: 1,
      name: 'Senior 3A',
      level: 'Senior 3',
      section: 'A',
      teacher: 'Jean Paul Mukandoli',
      subject: 'Mathematics',
      studentCount: 35,
      maxCapacity: 40,
      schedule: 'Mon-Fri 08:00-09:30',
      room: 'Block A - Room 101',
      status: 'active',
      averageGrade: 85,
    },
    {
      id: 2,
      name: 'Senior 3B',
      level: 'Senior 3',
      section: 'B',
      teacher: 'Marie Nyinaweza',
      subject: 'English',
      studentCount: 32,
      maxCapacity: 40,
      schedule: 'Mon-Fri 09:45-11:15',
      room: 'Block A - Room 102',
      status: 'active',
      averageGrade: 82,
    },
    {
      id: 3,
      name: 'Senior 2A',
      level: 'Senior 2',
      section: 'A',
      teacher: 'Emmanuel Habimana',
      subject: 'Physics',
      studentCount: 38,
      maxCapacity: 40,
      schedule: 'Mon-Fri 11:30-13:00',
      room: 'Block B - Room 201',
      status: 'active',
      averageGrade: 78,
    },
    {
      id: 4,
      name: 'Senior 2B',
      level: 'Senior 2',
      section: 'B',
      teacher: 'Grace Mutesi',
      subject: 'Chemistry',
      studentCount: 0,
      maxCapacity: 40,
      schedule: 'Mon-Fri 13:30-15:00',
      room: 'Block B - Room 202',
      status: 'inactive',
      averageGrade: 0,
    },
    {
      id: 5,
      name: 'Senior 1A',
      level: 'Senior 1',
      section: 'A',
      teacher: 'Peter Uwimana',
      subject: 'Biology',
      studentCount: 36,
      maxCapacity: 40,
      schedule: 'Mon-Fri 15:15-16:45',
      room: 'Block C - Room 301',
      status: 'active',
      averageGrade: 88,
    },
  ])

  const levels = ['all', ...new Set(classes.map((c) => c.level))]

  const filteredClasses = classes
    .filter((cls) => {
      const matchesSearch =
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.room.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLevel = filterLevel === 'all' || cls.level === filterLevel
      const matchesStatus = filterStatus === 'all' || cls.status === filterStatus

      return matchesSearch && matchesLevel && matchesStatus
    })
    .sort((a, b) => b.studentCount - a.studentCount)

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return 'text-green-600'
    if (grade >= 75) return 'text-blue-600'
    if (grade >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: Class['status']) => {
    return status === 'active' ? 'success' : 'warning'
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
      searchPlaceholder="Search classes..."
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Classes</h1>
            <p className="text-muted-foreground mt-1">Manage {classes.length} classes</p>
          </div>
          <Button className="gap-2" onClick={() => router.push('/admin/classes-modern/add')}>
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{classes.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active and inactive</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {classes.filter((c) => c.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Currently operating</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {classes.reduce((sum, c) => sum + c.studentCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all classes</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Grade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(
                  classes.filter((c) => c.averageGrade > 0).reduce((sum, c) => sum + c.averageGrade, 0) /
                    classes.filter((c) => c.averageGrade > 0).length
                )}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
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
                  placeholder="Search by class name, teacher, or subject..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="h-10 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level}
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
                </select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredClasses.length} of {classes.length} classes
            </p>
          </CardContent>
        </Card>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => (
              <Card key={cls.id} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{cls.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {cls.level} · {cls.subject}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(cls.status)}>
                      {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Teacher */}
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-medium text-foreground">{cls.teacher}</p>
                  </div>

                  {/* Capacity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Student Capacity</p>
                      <p className="font-medium text-foreground">
                        {cls.studentCount}/{cls.maxCapacity}
                      </p>
                    </div>
                    <Progress
                      value={(cls.studentCount / cls.maxCapacity) * 100}
                      indicatorClassName={getCapacityColor(cls.studentCount, cls.maxCapacity)}
                    />
                  </div>

                  {/* Average Grade */}
                  {cls.averageGrade > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Average Grade</p>
                      <p className={`font-medium ${getGradeColor(cls.averageGrade)}`}>
                        {cls.averageGrade}%
                      </p>
                    </div>
                  )}

                  {/* Room & Schedule */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Room</p>
                      <p className="font-medium text-foreground">{cls.room}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Schedule</p>
                      <p className="font-medium text-foreground">{cls.schedule}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/admin/classes-modern/${cls.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/admin/classes-modern/${cls.id}/edit`)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this class?')) {
                          // Handle deletion
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 flex items-center justify-center h-64">
              <p className="text-muted-foreground">No classes found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ClassesModernPage
