"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Users, GraduationCap, Star, FileText, MessageSquare, AlertCircle, Shield, Calendar, Award } from "lucide-react"
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
import { fetchGrades, fetchReportCards } from "../api/grades"
import { fetchEvents, rsvpToEvent } from "../api/events"
import EventCalendar from "../components/EventCalendar"
import { fetchScholarships, fetchMyApplications, applyForScholarship } from "../api/scholarships"

export default function StudentAccess() {
  const { t, language } = useLanguage()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'browse' | 'applications' | 'comments' | 'grades' | 'events' | 'scholarships' | 'surveys'>('browse')
  const [schools, setSchools] = useState<School[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [ratingSchoolId, setRatingSchoolId] = useState<string | null>(null)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [myGrades, setMyGrades] = useState<any[]>([])
  const [myReportCards, setMyReportCards] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [scholarships, setScholarships] = useState<any[]>([])
  const [myScholarshipApps, setMyScholarshipApps] = useState<any[]>([])
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [loadingScholarships, setLoadingScholarships] = useState(false)

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Check authentication and role on mount - only students can access
  useEffect(() => {
    // Wait for auth to load before checking roles
    if (authLoading) return;
    
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
  }, [isAuthenticated, user, router, authLoading])

  useEffect(() => {
    // Wait for auth to be ready before loading schools
    if (authLoading) return;
    
    // Only load schools if user is a student or not authenticated (for browsing)
    if (!isAuthenticated || user?.role === 'student') {
      let isMounted = true;
      const loadSchools = async () => {
        try {
          console.log('Loading schools...');
          const schoolsData = await fetchSchools()
          if (isMounted) {
            console.log('Schools loaded:', schoolsData.length);
            setSchools(schoolsData)
          }
        } catch (error) {
          console.error("Error fetching schools:", error)
        }
      }
      loadSchools()
      return () => {
        isMounted = false;
      }
    }
  }, [isAuthenticated, user?.role, authLoading])

  // Check for tab query parameter on mount
  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    if (tabParam && (tabParam === 'browse' || tabParam === 'applications' || tabParam === 'comments')) {
      setActiveTab(tabParam as 'browse' | 'applications' | 'comments')
    }

    // Check for search query parameter
    const searchParam = searchParams?.get('search')
    if (searchParam) {
      setSearchTerm(searchParam)
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
    { id: 'grades' as const, label: 'My Grades', icon: GraduationCap },
    { id: 'events' as const, label: 'Events', icon: Calendar },
    { id: 'scholarships' as const, label: 'Scholarships', icon: Award },
    { id: 'comments' as const, label: 'Comments', icon: MessageSquare },
  ]

  // Load grades when tab is active
  useEffect(() => {
    if (activeTab === 'grades' && user?.id) {
      setLoadingGrades(true)
      Promise.all([
        fetchGrades({ student_id: user.id }),
        fetchReportCards(user.id)
      ])
        .then(([grades, reportCards]) => {
          setMyGrades(grades)
          setMyReportCards(reportCards)
        })
        .catch(err => console.error('Error loading grades:', err))
        .finally(() => setLoadingGrades(false))
    }
  }, [activeTab, user?.id])

  // Load events when tab is active
  useEffect(() => {
    if (activeTab === 'events') {
      setLoadingEvents(true)
      fetchEvents()
        .then(setEvents)
        .catch(err => console.error('Error loading events:', err))
        .finally(() => setLoadingEvents(false))
    }
  }, [activeTab])

  // Load scholarships when tab is active
  useEffect(() => {
    if (activeTab === 'scholarships') {
      setLoadingScholarships(true)
      Promise.all([
        fetchScholarships({ status: 'active' }),
        fetchMyApplications()
      ])
        .then(([scholarshipList, apps]) => {
          setScholarships(scholarshipList)
          setMyScholarshipApps(apps)
        })
        .catch(err => console.error('Error loading scholarships:', err))
        .finally(() => setLoadingScholarships(false))
    }
  }, [activeTab])

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
                        const canRate = !user || user.role === 'student'; // Students and unauthenticated can rate

                        return (
                          <>
                            {[1, 2, 3, 4, 5].map((star) => (
                              canRate ? (
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
                              ) : (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 mr-1 ${star <= rounded
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                    }`}
                                />
                              )
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

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Grades & Report Cards</h2>
              <p className="text-gray-600">
                View your academic performance and generated report cards
              </p>
            </div>

            {loadingGrades ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading grades...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Report Cards Section */}
                {myReportCards.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Cards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myReportCards.map((report) => (
                        <div key={report.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-gray-900">{report.school_name}</h4>
                              <p className="text-sm text-gray-600">{report.term} {report.academic_year}</p>
                            </div>
                            <div className="text-center">
                              <div className={`text-3xl font-bold ${
                                report.overall_grade === 'A' ? 'text-green-600' :
                                report.overall_grade === 'B' ? 'text-blue-600' :
                                report.overall_grade === 'C' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {report.overall_grade}
                              </div>
                              <p className="text-xs text-gray-600">{report.overall_percentage?.toFixed(1)}%</p>
                            </div>
                          </div>
                          {report.teacher_comments && (
                            <div className="bg-white rounded p-3 mt-3">
                              <p className="text-xs font-semibold text-gray-700 mb-1">Teacher Comments:</p>
                              <p className="text-sm text-gray-600">{report.teacher_comments}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Grades */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Grades</h3>
                  {myGrades.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No grades available yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">School</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {myGrades.map((grade) => (
                            <tr key={grade.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{grade.subject}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  grade.grade === 'A' ? 'bg-green-100 text-green-800' :
                                  grade.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                  grade.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {grade.grade}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{grade.score}/{grade.max_score}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{grade.term} {grade.academic_year}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{grade.school_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{grade.comments || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
              <p className="text-gray-600">
                Stay updated with school events and activities
              </p>
            </div>

            <EventCalendar
              onEventClick={(event) => {
                // Show event details and allow RSVP
                const rsvp = confirm(`Event: ${event.title}\nDate: ${new Date(event.start_date).toLocaleString()}\n${event.description || ''}\n\nWould you like to RSVP?`);
                if (rsvp) {
                  rsvpToEvent(event.id, 'attending')
                    .then(() => alert('RSVP confirmed!'))
                    .catch(err => alert('Failed to RSVP'));
                }
              }}
              schoolId={undefined}
            />
          </div>
        )}

        {/* Scholarships Tab */}
        {activeTab === 'scholarships' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Scholarship Opportunities</h2>
              <p className="text-gray-600">
                Explore and apply for scholarships to support your education
              </p>
            </div>

            {loadingScholarships ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading scholarships...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* My Applications */}
                {myScholarshipApps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">My Applications</h3>
                    <div className="space-y-3">
                      {myScholarshipApps.map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <h4 className="font-semibold text-gray-900">{app.scholarship_title}</h4>
                            <p className="text-sm text-gray-600">{app.school_name}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            app.status === 'approved' ? 'bg-green-100 text-green-700' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Scholarships */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Scholarships</h3>
                  {scholarships.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No scholarships available at this time</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {scholarships.map((scholarship) => {
                        const alreadyApplied = myScholarshipApps.some(app => app.scholarship_id === scholarship.id);
                        return (
                          <div key={scholarship.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Award className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-1">{scholarship.title}</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">{scholarship.description}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="font-semibold text-gray-900">
                                  {scholarship.amount?.toLocaleString()} {scholarship.currency}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Deadline</p>
                                <p className="font-semibold text-gray-900">
                                  {scholarship.application_deadline ? new Date(scholarship.application_deadline).toLocaleDateString() : 'Open'}
                                </p>
                              </div>
                            </div>
                            {scholarship.eligibility_criteria && (
                              <div className="bg-white rounded p-3 mb-4">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Eligibility:</p>
                                <p className="text-xs text-gray-600 line-clamp-2">{scholarship.eligibility_criteria}</p>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                if (alreadyApplied) {
                                  alert('You have already applied for this scholarship');
                                } else {
                                  router.push(`/scholarships/${scholarship.id}/apply`);
                                }
                              }}
                              disabled={alreadyApplied}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                alreadyApplied
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                              }`}
                            >
                              {alreadyApplied ? 'Already Applied' : 'Apply Now'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
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
