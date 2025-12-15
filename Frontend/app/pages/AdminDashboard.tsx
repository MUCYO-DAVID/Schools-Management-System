"use client"

import { useState } from "react"
import { BarChart3, Users, School, TrendingUp, Plus, Edit, Trash2, Eye } from "lucide-react"
import type { School as SchoolType } from "../types"
import { useLanguage } from "../page"

interface AdminDashboardProps {
  schools: SchoolType[]
  setSchools: (schools: SchoolType[]) => void
}

export default function AdminDashboard({ schools, setSchools }: AdminDashboardProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")

  const totalStudents = schools.reduce((sum, school) => sum + school.students, 0)
  const publicSchools = schools.filter((s) => s.type === "Public").length
  const privateSchools = schools.filter((s) => s.type === "Private").length

  const stats = [
    {
      title: "Total Schools",
      value: schools.length,
      icon: School,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Total Students",
      value: totalStudents.toLocaleString(),
      icon: Users,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Public Schools",
      value: publicSchools,
      icon: BarChart3,
      color: "bg-yellow-500",
      change: "+5%",
    },
    {
      title: "Private Schools",
      value: privateSchools,
      icon: TrendingUp,
      color: "bg-purple-500",
      change: "+15%",
    },
  ]

  const recentActivities = [
    { action: "New school registered", school: "Green Hills Academy", time: "2 hours ago" },
    { action: "Student count updated", school: "Kigali International School", time: "4 hours ago" },
    { action: "School information edited", school: "Rwanda Education Board School", time: "1 day ago" },
    { action: "New admin user added", school: "System", time: "2 days ago" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("admin")}</h1>
        <p className="text-gray-600">Manage schools and monitor system performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change} from last month</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview" },
              { id: "schools", label: "School Management" },
              { id: "users", label: "User Management" },
              { id: "reports", label: "Reports" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.school}</p>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Add New School</span>
                  </button>
                  <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Manage Users</span>
                  </button>
                  <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">View Reports</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "schools" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">School Management</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add School
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schools.map((school) => (
                      <tr key={school.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{school.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{school.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              school.type === "Public" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {school.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.students}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">User Management</h4>
                <p className="text-gray-600">User management functionality will be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Reports & Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">School Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Public Schools</span>
                      <span className="font-medium">{publicSchools}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Private Schools</span>
                      <span className="font-medium">{privateSchools}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="font-bold">{schools.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Student Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average per School</span>
                      <span className="font-medium">{Math.round(totalStudents / schools.length)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Largest School</span>
                      <span className="font-medium">{Math.max(...schools.map((s) => s.students))}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="font-medium text-gray-900">Total Students</span>
                      <span className="font-bold">{totalStudents.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
