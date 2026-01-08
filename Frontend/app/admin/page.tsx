'use client';
import { useState, useEffect } from "react"
import { BarChart3, Users, School, TrendingUp, Plus, Edit, Trash2, Eye, Activity } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import type { School as SchoolType } from "../types"
import { useAuth } from "../providers/AuthProvider"

import { useRouter, useSearchParams } from "next/navigation"
import {
  fetchSchools,
  formatTimeAgo,
  addSchool,
  updateSchool,
  deleteSchool,
} from "@/api/school";
import SchoolModal from "../components/SchoolModal"
import SchoolRegistrationChart from "../components/SchoolRegistrationChart"

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [schools, setSchools] = useState<SchoolType[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [recentActivities, setRecentActivities] = useState([]);
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Next.js app router helpers
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin"); // Redirect to signin if not authenticated
    } else if (user?.role !== "admin") {
      router.push("/home"); // Redirect to home if not admin
    }
  }, [isAuthenticated, user, router]);

  // If a "tab" query param is present (e.g. /admin?tab=users), open that tab on load
  useEffect(() => {
    // Only run this effect if searchParams is available (client-side)
    if (searchParams) {
      const tab = searchParams.get("tab");
      if (tab) setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString?.()])

  // Open modal for adding a new school
  const handleAddSchool = () => {
    setEditingSchool(null); // no editing, new school
    setIsModalOpen(true);
  };

  // Add User handler — prompt for name and POST to /api/users, then open Users tab and update URL.
  const handleAddUser = async () => {
    const name = window.prompt("Full name for the new user:")
    if (!name) return
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error("Failed to create user")
      alert("User created")
      setActiveTab("users")
      router.push("/admin?tab=users")
    } catch (err) {
      console.error("Add user failed:", err)
      alert("Failed to add user.")
    }
  }

  // Open modal for editing a school
  const handleUpdateSchool = (school: SchoolType) => {
    setEditingSchool(school);
    setIsModalOpen(true);
  };

  // Delete school confirmation handler
  const handleDeleteSchool = async (id: string) => {
    try {
      await deleteSchool(id);
      setSchools((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      alert("Failed to delete school.");
    }
  };

  // Save school handler for both add and update
  const handleSaveSchool = async (schoolData: Omit<SchoolType, "id">, images: File[], imagesToDelete: string[]) => {
    try {
      if (editingSchool) {
        const updated = await updateSchool(editingSchool.id, schoolData, images, imagesToDelete);
        setSchools((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
      } else {
        const added = await addSchool(schoolData, images);
        setSchools((prev) => [...prev, added]);
      }
      setIsModalOpen(false);
      setEditingSchool(null);
    } catch (error) {
      alert("Failed to save school.");
    }
  };

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const schoolsData = await fetchSchools();
        setSchools(schoolsData);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    loadSchools();
  }, []);
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
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities/recent`);
        if (!res.ok) throw new Error("Failed to fetch activities");
        const data = await res.json();
        setRecentActivities(data);
      } catch (error) {
        console.error("Error loading activities:", error);
      }
    };

    fetchActivities();
  }, []);



  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "schools", label: "School Management", icon: School },
    { id: "users", label: "User Management", icon: Users },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("admin")} </h1>
          <p className="text-gray-600">Manage schools and monitor system performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-1 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      router.push(`/admin?tab=${tab.id}`);
                    }}
                    className={`py-4 px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* School Registration Chart */}
                <div>
                  <SchoolRegistrationChart schools={schools} />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {recentActivities.length === 0 ? (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No recent activities</p>
                        </div>
                      ) : (
                        recentActivities.map(({ id, action, school, created_at }) => (
                          <div
                            key={id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{action}</p>
                              <p className="text-sm text-gray-600">{school}</p>
                            </div>
                            <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{formatTimeAgo(created_at)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => { setActiveTab("schools"); router.push("/admin?tab=schools") }}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-blue-900 block">Add New School</span>
                          <span className="text-xs text-blue-700">Register a new school in the system</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab("users"); router.push("/admin?tab=users") }}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="p-2 bg-green-600 rounded-lg">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-green-900 block">Manage Users</span>
                          <span className="text-xs text-green-700">View and manage system users</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab("reports"); router.push("/admin?tab=reports") }}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="p-2 bg-purple-600 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-purple-900 block">View Reports</span>
                          <span className="text-xs text-purple-700">Access detailed analytics and reports</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "schools" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">School Management</h3>
                  <button
                    onClick={handleAddSchool}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-5 h-5" />
                    {t("addSchool")}
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
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${school.type === "Public" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {school.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.students}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button

                                className="text-blue-600 hover:text-blue-900"
                                aria-label={`View details of ${school.name}`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateSchool(school)}
                                className="text-green-600 hover:text-green-900"
                                aria-label={`Edit ${school.name}`}

                              >

                                <Edit className="w-4 h-4" />
                              </button>

                              <button

                                onClick={() => handleDeleteSchool(school.id)}

                                className="text-red-600 hover:text-red-900"

                                aria-label={`Delete ${school.name}`}
                              >
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
                  <button
                    onClick={handleAddUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    type="button"
                  >
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Reports & Analytics</h3>
                </div>

                {/* School Registration Chart in Reports */}
                <div className="mb-6">
                  <SchoolRegistrationChart schools={schools} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <School className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">School Distribution</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-600 font-medium">Public Schools</span>
                        <span className="font-bold text-blue-600 text-lg">{publicSchools}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-600 font-medium">Private Schools</span>
                        <span className="font-bold text-purple-600 text-lg">{privateSchools}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-blue-200">
                        <span className="font-bold text-gray-900">Total Schools</span>
                        <span className="font-bold text-2xl text-gray-900">{schools.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Student Statistics</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-600 font-medium">Average per School</span>
                        <span className="font-bold text-green-600 text-lg">
                          {schools.length > 0 ? Math.round(totalStudents / schools.length) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-gray-600 font-medium">Largest School</span>
                        <span className="font-bold text-green-600 text-lg">
                          {schools.length > 0 ? Math.max(...schools.map((s) => s.students)) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-200">
                        <span className="font-bold text-gray-900">Total Students</span>
                        <span className="font-bold text-2xl text-gray-900">{totalStudents.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isModalOpen && (
              <SchoolModal school={editingSchool} onSave={handleSaveSchool}
                onClose={() => setIsModalOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
