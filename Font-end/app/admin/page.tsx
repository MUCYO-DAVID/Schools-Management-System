"use client"

import { useState,useEffect } from "react"
import { BarChart3, Users, School, TrendingUp, Plus, Edit, Trash2, Eye } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import type { School as SchoolType } from "../types"

import {
  fetchSchools,
  formatTimeAgo,
  addSchool,
  updateSchool,
  deleteSchool,
} from "@/api/school";
import SchoolModal from "../components/SchoolModal"

export default function AdminDashboard() {
  const { t } = useLanguage()
  const [schools,setSchools] = useState<SchoolType[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [recentActivities, setRecentActivities] = useState([]);
  const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);

// Open modal for adding a new school
const handleAddSchool = () => {
  setEditingSchool(null); // no editing, new school
  setIsModalOpen(true);
};

// Open modal for editing a school
const handleUpdateSchool = async (schoolData: Omit<SchoolType, "id">) => {
  if (!editingSchool) return;
  // Combine id with updated data
  await updateSchool(editingSchool.id, schoolData);
  
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
const handleSaveSchool = async (schoolData: Omit<SchoolType, "id">) => {
  try {
    if (editingSchool) {
      
      const updated = await updateSchool(editingSchool.id, schoolData);
      setSchools((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    } else {
      
      const added = await addSchool(schoolData);
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



  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("admin")} Dashboard</h1>
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
        {recentActivities.length === 0 ? (
          <p className="text-gray-600">No recent activities</p>
        ) : (
          recentActivities.map(({ id, action, school, created_at }) => (
            <div
              key={id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{action}</p>
                <p className="text-sm text-gray-600">{school}</p>
              </div>
              <span className="text-sm text-gray-500">{formatTimeAgo(created_at)}</span>
            </div>
          ))
        )}
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
              {isModalOpen && (
                      <SchoolModal school={editingSchool} onSave={editingSchool ? handleUpdateSchool : handleSaveSchool} onClose={() => setIsModalOpen(false)} />
                    )}
          </div>
        </div>
      </div>
    </div>
  )
}
