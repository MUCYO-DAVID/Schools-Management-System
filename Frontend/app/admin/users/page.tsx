'use client'

import React, { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DataTable, { Column } from '@/components/dashboard/DataTable'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'teacher', status: 'active', joinDate: 'Jan 15, 2024' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active', joinDate: 'Jan 10, 2024' },
    { id: 3, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'student', status: 'active', joinDate: 'Feb 1, 2024' },
    { id: 4, name: 'Michael Brown', email: 'michael@example.com', role: 'parent', status: 'pending', joinDate: 'Mar 5, 2024' },
    { id: 5, name: 'Emily Davis', email: 'emily@example.com', role: 'teacher', status: 'active', joinDate: 'Jan 20, 2024' },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<keyof User | undefined>()
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSort = (key: keyof User) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      width: '25%',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar
            initials={value.split(' ').map((n) => n[0]).join('')}
            size="sm"
          />
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      width: '15%',
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '15%',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'active'
            ? 'bg-green-100 text-green-800'
            : value === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      sortable: true,
      width: '20%',
      render: (value) => <span className="text-muted-foreground">{value}</span>,
    },
    {
      key: 'id',
      label: '',
      width: '10%',
      render: () => (
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
            <p className="text-muted-foreground mt-1">Manage system users and permissions</p>
          </div>
          <Button variant="primary" size="md" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search users..."
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
          title={`Total Users: ${filteredUsers.length}`}
          columns={columns}
          data={filteredUsers}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>
    </DashboardLayout>
  )
}
