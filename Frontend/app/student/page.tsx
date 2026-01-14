"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Users, GraduationCap, Star, FileText, MessageSquare, AlertCircle, Shield } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import { useAuth } from "../providers/AuthProvider"
import type { School } from "../types"
import { fetchSchools, rateSchool } from "@/api/school"
import ApplicationForm from "../components/ApplicationForm"
import StudentDashboard from "../components/StudentDashboard"
import SchoolDetailsModal from "../components/SchoolDetailsModal"
import SurveyCommentsFeed from "../components/SurveyCommentsFeed"
import { useRouter, useSearchParams } from "next/navigation"

export default function StudentAccess() {
  const { t, language } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'browse' | 'applications' | 'comments'>('browse')
  const [schools, setSchools] = useState<School[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [ratingSchoolId, setRatingSchoolId] = useState<string | null>(null)
  const [applicationSuccess, setApplicationSuccess] = useState(false)

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Check authentication and role on mount - only students can access
  useEffect(() => {
    if (isAuthenticated && user) {
      // Leaders and admins should not access student page
      if (user.role === 'leader') {
        router.push('/schools')
        return
      }
      if (user.role === 'admin') {
        router.push('/admin')
        return
      }
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    // Only load schools if user is a student or not authenticated (for browsing)
    if (!isAuthenticated || user?.role === 'student') {
      const loadSchools = async () => {
        try {
          const schoolsData = await fetchSchools()
          setSchools(schoolsData)
        } catch (error) {
          console.error("Error fetching:", error)
        }
      }
      loadSchools()
    }
  }, [isAuthenticated, user])

  // Check for tab query parameter on mount
  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    if (tabParam && (tabParam === 'browse' || tabParam === 'applications' || tabParam === 'comments')) {
      setActiveTab(tabParam as 'browse' | 'applications' | 'comments')
    }
  }, [searchParams])

  useEffect(() => {
    if (applicationSuccess) {
      setActiveTab('applications')
      setApplicationSuccess(false)
    }
  }, [applicationSuccess])

  const handleRate = async (schoolId: string, value: number) => {
    try {
      setRatingSchoolId(schoolId)
      await rateSchool(schoolId, value)
      setSchools((prev) =>
        prev.map((s) =>
          s.id === schoolId
            ? {
              ...s,
              rating_total: (s.rating_total ?? 0) + value,
              rating_count: (s.rating_count ?? 0) + 1,
              average_rating:
                ((s.rating_total ?? 0) + value) / ((s.rating_count ?? 0) + 1),
            }
            : s,
        ),
      )
    } catch (error) {
      console.error("Failed to rate school:", error)
    } finally {
      setRatingSchoolId(null)
    }
  }


  const handleApplyClick = (school: School) => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }
    setSelectedSchool(school)
    setShowApplicationForm(true)
  }

  const tabs = [
    { id: 'browse' as const, label: 'Browse Schools', icon: Search },
    { id: 'applications' as const, label: 'My Applications', icon: FileText },
    { id: 'comments' as const, label: 'Comments', icon: MessageSquare },
  ]

  // Show access denied message if user is a leader or admin
  if (isAuthenticated && user && (user.role === 'leader' || user.role === 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700 mb-4">
              This page is only accessible to students.
            </p>
            <p className="text-red-600 text-sm mb-4">
              School leaders and administrators cannot access the student portal to prevent conflicts of interest.
            </p>
            {user.role === 'leader' && (
              <button
                onClick={() => router.push('/schools')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Schools Management
              </button>
            )}
            {user.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t("student")} Portal</h1>
          </div>
          <p className="text-gray-600">Find schools, apply, and share your feedback</p>
          <p className="text-sm text-gray-500 mt-1">Restricted to students only</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Browse Schools Tab */}
        {activeTab === 'browse' && (
          <>
            {/* Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for schools by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* School Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchools.map((school) => (
                <div
                  key={school.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {school.image_urls && school.image_urls.length > 0 && (
                    <div className="relative h-32 w-full overflow-hidden">
                      <img
                        src={school.image_urls[0]}
                        alt={school.name}
                        className="absolute h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {language === "rw" ? school.nameRw : school.name}
                    </h3>

                    <div className="flex items-center mb-2">
                      {(() => {
                        const avg =
                          school.average_rating && school.average_rating > 0
                            ? school.average_rating
                            : 0
                        const rounded = Math.round(avg * 2) / 2
                        return (
                          <>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRate(school.id, star)
                                }}
                                className="mr-1"
                                disabled={ratingSchoolId === school.id}
                              >
                                <Star
                                  className={`w-4 h-4 ${star <= rounded
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                    }`}
                                />
                              </button>
                            ))}
                            <span className="ml-2 text-xs text-gray-500">
                              {school.rating_count ?? 0}
                            </span>
                          </>
                        )
                      })()}
                    </div>

                    <div className="space-y-2 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{school.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{school.students} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{school.level}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${school.type === "Public" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {school.type}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSchool(school)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                        {isAuthenticated && (
                          <button
                            onClick={() => handleApplyClick(school)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-medium"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSchools.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
                <p className="text-gray-600">Try adjusting your search terms</p>
              </div>
            )}
          </>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {isAuthenticated ? (
              <StudentDashboard />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view applications</h3>
                <p className="text-gray-600 mb-4">You need to be signed in to view and manage your applications</p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {/* Comments Tab - Show all comments from all schools */}
        {activeTab === 'comments' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Comments</h2>
              <p className="text-gray-600 text-sm">
                View and interact with comments from all schools in the system. Like and reply to share your thoughts!
              </p>
            </div>
            <SurveyCommentsFeed />
          </div>
        )}

        {/* School Details Modal */}
        {selectedSchool && !showApplicationForm && (
          <SchoolDetailsModal
            school={selectedSchool}
            onClose={() => setSelectedSchool(null)}
            onApply={() => {
              if (isAuthenticated) {
                setShowApplicationForm(true)
              } else {
                router.push('/auth/signin')
              }
            }}
          />
        )}

        {/* Application Form Modal */}
        {showApplicationForm && selectedSchool && (
          <ApplicationForm
            school={selectedSchool}
            onClose={() => {
              setShowApplicationForm(false)
              setSelectedSchool(null)
            }}
            onSuccess={() => {
              setApplicationSuccess(true)
              setShowApplicationForm(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
