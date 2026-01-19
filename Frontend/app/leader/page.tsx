"use client"

import { useState, useEffect } from "react"
import { FileText, AlertCircle, School, Users, Calendar, Mail, Phone, MapPin, GraduationCap, Clock, CheckCircle, XCircle, ThumbsUp, ThumbsDown, Download } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import { useAuth } from "../providers/AuthProvider"
import { getLeaderApplications, approveApplication, rejectApplication, type LeaderApplication } from "@/app/api/student"
import { useRouter } from "next/navigation"
import { BASE_URL } from "@/api/school"

export default function LeaderDashboard() {
  const { t } = useLanguage()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<LeaderApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<LeaderApplication | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'withdrawn'>('all')
  const [searchTerm, setSearchTerm] = useState("")
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<LeaderApplication | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  // Check authentication and role on mount - only leaders can access
  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }
    if (user && user.role !== 'leader' && user.role !== 'admin') {
      router.push('/student')
      return
    }
  }, [isAuthenticated, user, router, authLoading])

  // Fetch applications
  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) return;
    
    if (isAuthenticated && user && (user.role === 'leader' || user.role === 'admin')) {
      const fetchApplications = async () => {
        try {
          setLoading(true)
          console.log('Fetching leader applications...');
          const data = await getLeaderApplications()
          console.log('Leader applications loaded:', data.length);
          setApplications(data)
        } catch (err: any) {
          console.error('Error fetching leader applications:', err);
          setError(err.message || 'Failed to fetch applications')
        } finally {
          setLoading(false)
        }
      }
      fetchApplications()
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading])

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch = 
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Group applications by school
  const applicationsBySchool = filteredApplications.reduce((acc, app) => {
    const schoolName = app.school_name || 'Unknown School'
    if (!acc[schoolName]) {
      acc[schoolName] = []
    }
    acc[schoolName].push(app)
    return acc
  }, {} as Record<string, LeaderApplication[]>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'withdrawn':
        return <XCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleApprove = async (application: LeaderApplication) => {
    if (!confirm(`Are you sure you want to approve ${application.first_name} ${application.last_name}'s application?`)) {
      return
    }

    try {
      setActionLoading(application.id)
      setActionError(null)
      await approveApplication(application.id)
      
      // Refresh applications
      const updatedApps = await getLeaderApplications()
      setApplications(updatedApps)
      
      alert('Application approved successfully! Student has been notified via email.')
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve application')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = (application: LeaderApplication) => {
    setShowRejectModal(application)
    setRejectionReason("")
    setActionError(null)
  }

  const confirmReject = async () => {
    if (!showRejectModal) return
    
    if (!rejectionReason.trim()) {
      setActionError('Please provide a reason for rejection')
      return
    }

    try {
      setActionLoading(showRejectModal.id)
      setActionError(null)
      await rejectApplication(showRejectModal.id, rejectionReason)
      
      // Refresh applications
      const updatedApps = await getLeaderApplications()
      setApplications(updatedApps)
      
      setShowRejectModal(null)
      setRejectionReason("")
      alert('Application rejected. Student has been notified via email.')
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject application')
    } finally {
      setActionLoading(null)
    }
  }

  const parseDocumentUrls = (docUrls: any): string[] => {
    if (!docUrls) return []
    if (typeof docUrls === 'string') {
      try {
        return JSON.parse(docUrls).map((url: string) => 
          url.startsWith('http') ? url : `${BASE_URL}${url}`
        )
      } catch {
        return []
      }
    }
    if (Array.isArray(docUrls)) {
      return docUrls.map((url: string) =>
        url.startsWith('http') ? url : `${BASE_URL}${url}`
      )
    }
    return []
  }

  // Show access denied if not a leader
  if (isAuthenticated && user && user.role !== 'leader' && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700 mb-4">
              This page is only accessible to school leaders.
            </p>
            <button
              onClick={() => router.push('/student')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Student Portal
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <School className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">School Leader Dashboard</h1>
          </div>
          <p className="text-gray-600">View and manage applications to your schools</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(a => a.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {applications.filter(a => a.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Applications by School */}
        {Object.keys(applicationsBySchool).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Applications to your schools will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(applicationsBySchool).map(([schoolName, schoolApps]) => (
              <div key={schoolName} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <School className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">{schoolName}</h2>
                    <span className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {schoolApps.length} {schoolApps.length === 1 ? 'application' : 'applications'}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {schoolApps.map((app) => (
                    <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {app.first_name} {app.last_name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                  {getStatusIcon(app.status)}
                                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Applied on {formatDate(app.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{app.email}</span>
                            </div>
                            {app.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{app.phone}</span>
                              </div>
                            )}
                            {app.current_grade && (
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <span>Current: {app.current_grade}</span>
                              </div>
                            )}
                            {app.desired_grade && (
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <span>Desired: {app.desired_grade}</span>
                              </div>
                            )}
                          </div>

                          {app.parent_name && (
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-sm font-medium text-gray-700 mb-1">Parent/Guardian Information</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span>{app.parent_name}</span>
                                </div>
                                {app.parent_email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span>{app.parent_email}</span>
                                  </div>
                                )}
                                {app.parent_phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{app.parent_phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {app.additional_info && (
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-sm font-medium text-gray-700 mb-1">Additional Information</p>
                              <p className="text-sm text-gray-600">{app.additional_info}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                          >
                            View Details
                          </button>
                          
                          {app.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(app)}
                                disabled={actionLoading === app.id}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(app)}
                                disabled={actionLoading === app.id}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                <ThumbsDown className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedApplication.first_name} {selectedApplication.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedApplication.email}</span>
                  </div>
                  {selectedApplication.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedApplication.phone}</span>
                    </div>
                  )}
                  {selectedApplication.date_of_birth && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="font-medium">{formatDate(selectedApplication.date_of_birth)}</span>
                    </div>
                  )}
                  {selectedApplication.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{selectedApplication.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Information</h3>
                <div className="space-y-2 text-sm">
                  {selectedApplication.current_grade && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Grade:</span>
                      <span className="font-medium">{selectedApplication.current_grade}</span>
                    </div>
                  )}
                  {selectedApplication.desired_grade && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Desired Grade:</span>
                      <span className="font-medium">{selectedApplication.desired_grade}</span>
                    </div>
                  )}
                  {selectedApplication.previous_school && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Previous School:</span>
                      <span className="font-medium">{selectedApplication.previous_school}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedApplication.parent_name && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Parent/Guardian Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedApplication.parent_name}</span>
                    </div>
                    {selectedApplication.parent_email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedApplication.parent_email}</span>
                      </div>
                    )}
                    {selectedApplication.parent_phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedApplication.parent_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusIcon(selectedApplication.status)}
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applied:</span>
                    <span className="font-medium">{formatDate(selectedApplication.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{formatDate(selectedApplication.updated_at)}</span>
                  </div>
                </div>
              </div>

              {selectedApplication.additional_info && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                  <p className="text-sm text-gray-700">{selectedApplication.additional_info}</p>
                </div>
              )}

              {selectedApplication.document_urls && parseDocumentUrls(selectedApplication.document_urls).length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Supporting Documents</h3>
                  <div className="space-y-2">
                    {parseDocumentUrls(selectedApplication.document_urls).map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900 flex-1">
                          Document {index + 1} - {url.endsWith('.pdf') ? 'PDF' : 'Image'}
                        </span>
                        <Download className="w-4 h-4 text-blue-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.rejection_reason && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">Rejection Reason</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{selectedApplication.rejection_reason}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex gap-2">
                {selectedApplication.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedApplication(null)
                        handleApprove(selectedApplication)
                      }}
                      disabled={actionLoading === selectedApplication.id}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApplication(null)
                        handleReject(selectedApplication)
                      }}
                      disabled={actionLoading === selectedApplication.id}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-red-50 border-b border-red-200 px-6 py-4">
              <h2 className="text-xl font-bold text-red-900">Reject Application</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                You are about to reject the application from <strong>{showRejectModal.first_name} {showRejectModal.last_name}</strong>.
              </p>
              <p className="text-sm text-gray-600">
                Please provide a reason for the rejection. This will be sent to the student via email.
              </p>
              
              {actionError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {actionError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Application documents incomplete, Does not meet admission requirements, etc."
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectionReason("")
                  setActionError(null)
                }}
                disabled={actionLoading === showRejectModal.id}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={actionLoading === showRejectModal.id || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === showRejectModal.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <ThumbsDown className="w-4 h-4" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
