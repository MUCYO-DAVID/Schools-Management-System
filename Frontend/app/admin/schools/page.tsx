'use client'

import React, { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DataTable, { Column } from '@/components/dashboard/DataTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface School {
  id: number
  name: string
  location: string
  students: number
  teachers: number
  status: 'active' | 'inactive'
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([
    { id: 1, name: 'Central High School', location: 'Kigali', students: 850, teachers: 45, status: 'active' },
    { id: 2, name: 'St. Mary Academy', location: 'Kigali', students: 620, teachers: 32, status: 'active' },
    { id: 3, name: 'Riverside School', location: 'Butare', students: 480, teachers: 28, status: 'active' },
    { id: 4, name: 'Highland Institute', location: 'Gisenyi', students: 350, teachers: 22, status: 'inactive' },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof School | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSort = (key: keyof School) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const columns: Column<School>[] = [
    {
      key: 'name',
      label: 'School Name',
      sortable: true,
      width: '30%',
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      width: '20%',
    },
    {
      key: 'students',
      label: 'Students',
      sortable: true,
      width: '15%',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'teachers',
      label: 'Teachers',
      sortable: true,
      width: '15%',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '20%',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Schools Management</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor all schools</p>
          </div>
          <Button variant="primary" size="md" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add School
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button variant="outline" size="md" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <DataTable
          title={`Total Schools: ${filteredSchools.length}`}
          columns={columns}
          data={filteredSchools}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>
    </DashboardLayout>
  )
}
