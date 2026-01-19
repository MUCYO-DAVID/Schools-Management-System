'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Clock, CheckCircle, XCircle, Trash2, Eye, Search, ArrowRight, AlertCircle, Download, Bell } from 'lucide-react';
import { getStudentApplications, withdrawApplication, StudentApplication } from '../api/student';
import { formatDistanceToNow } from 'date-fns';
import { BASE_URL } from '@/api/school';
import { useAuth } from '../providers/AuthProvider';

export default function StudentDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  useEffect(() => {
    // Only fetch applications when authentication is ready and user is authenticated
    if (!authLoading && isAuthenticated) {
      loadApplications();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      console.log('Fetching student applications...');
      const data = await getStudentApplications();
      console.log('Applications loaded:', data.length);
      setApplications(data);
    } catch (error: any) {
      console.error('Error loading applications:', error);
      // If unauthorized, the error might be due to expired token
      if (error.message?.includes('401') || error.message?.includes('authorization')) {
        console.log('Token might be expired, please login again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      setWithdrawingId(id);
      await withdrawApplication(id);
      await loadApplications();
    } catch (error: any) {
      alert(error.message || 'Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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
  };

  // Count recent status updates (within last 7 days)
  const recentStatusUpdates = applications.filter(app => {
    if (app.status === 'pending') return false;
    const updatedDate = new Date(app.updated_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updatedDate > weekAgo;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
        <p className="text-sm text-gray-600 mb-6">Start by applying to a school from the student portal</p>
        <button
          onClick={() => router.push('/student?tab=browse')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
        >
          <Search className="w-5 h-5" />
          Browse Schools & Apply Now
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
        <span className="text-sm text-gray-600">{applications.length} application(s)</span>
      </div>

      {/* Recent Status Updates Notifications */}
      {recentStatusUpdates.length > 0 && (
        <div className="space-y-3 mb-6">
          {recentStatusUpdates.map((app) => (
            <div
              key={`notification-${app.id}`}
              className={`rounded-lg border p-4 ${
                app.status === 'approved'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${app.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    app.status === 'approved' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {app.status === 'approved' ? '🎉 Application Approved!' : '❌ Application Not Approved'}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    app.status === 'approved' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Your application to <strong>{app.school_name}</strong> has been {app.status}.
                    {app.status === 'approved' && ' The school will contact you with next steps.'}
                  </p>
                  {app.status === 'rejected' && app.rejection_reason && (
                    <div className="bg-red-100 border border-red-200 rounded p-3 text-sm text-red-900 mt-2">
                      <p className="font-medium mb-1">Reason:</p>
                      <p>{app.rejection_reason}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Updated {formatDistanceToNow(new Date(app.updated_at), { addSuffix: true })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApp(app)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {applications.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{app.school_name}</h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {getStatusIcon(app.status)}
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>
                    <span className="font-medium">Location:</span> {app.school_location}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span> {app.school_type} • {app.school_level}
                  </p>
                  <p>
                    <span className="font-medium">Applied:</span>{' '}
                    {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                  </p>
                  {app.desired_grade && (
                    <p>
                      <span className="font-medium">Desired Grade:</span> {app.desired_grade}
                    </p>
                  )}
                </div>

                {app.status === 'rejected' && app.rejection_reason && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-900 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Rejection Reason:
                    </p>
                    <p className="text-xs text-red-800">{app.rejection_reason}</p>
                  </div>
                )}

                {app.status === 'approved' && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-900 mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Congratulations!
                    </p>
                    <p className="text-xs text-green-800">The school will contact you with next steps for enrollment.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setSelectedApp(app)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {app.status === 'pending' && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    disabled={withdrawingId === app.id}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Withdraw Application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">School Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">School:</span>
                    <p className="text-gray-900">{selectedApp.school_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <p className="text-gray-900">{selectedApp.school_location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p className="text-gray-900">{selectedApp.school_type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Level:</span>
                    <p className="text-gray-900">{selectedApp.school_level}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <p className="text-gray-900">
                      {selectedApp.first_name} {selectedApp.last_name}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{selectedApp.email}</p>
                  </div>
                  {selectedApp.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-900">{selectedApp.phone}</p>
                    </div>
                  )}
                  {selectedApp.date_of_birth && (
                    <div>
                      <span className="font-medium text-gray-700">Date of Birth:</span>
                      <p className="text-gray-900">
                        {new Date(selectedApp.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedApp.current_grade && (
                    <div>
                      <span className="font-medium text-gray-700">Current Grade:</span>
                      <p className="text-gray-900">{selectedApp.current_grade}</p>
                    </div>
                  )}
                  {selectedApp.desired_grade && (
                    <div>
                      <span className="font-medium text-gray-700">Desired Grade:</span>
                      <p className="text-gray-900">{selectedApp.desired_grade}</p>
                    </div>
                  )}
                  {selectedApp.previous_school && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Previous School:</span>
                      <p className="text-gray-900">{selectedApp.previous_school}</p>
                    </div>
                  )}
                </div>
              </div>

              {(selectedApp.parent_name || selectedApp.parent_email) && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedApp.parent_name && (
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <p className="text-gray-900">{selectedApp.parent_name}</p>
                      </div>
                    )}
                    {selectedApp.parent_email && (
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-900">{selectedApp.parent_email}</p>
                      </div>
                    )}
                    {selectedApp.parent_phone && (
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <p className="text-gray-900">{selectedApp.parent_phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedApp.additional_info && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApp.additional_info}</p>
                </div>
              )}

              {selectedApp.document_urls && parseDocumentUrls(selectedApp.document_urls).length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Supporting Documents</h3>
                  <div className="space-y-2">
                    {parseDocumentUrls(selectedApp.document_urls).map((url, index) => (
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

              {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">Rejection Reason</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{selectedApp.rejection_reason}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    We encourage you to apply again in the future or consider other schools in the system.
                  </p>
                </div>
              )}

              {selectedApp.status === 'approved' && (
                <div className="border-t pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Application Approved!
                    </h3>
                    <p className="text-sm text-green-800">
                      Congratulations! The school will contact you soon with the next steps for enrollment.
                      Please keep an eye on your email for further instructions.
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4 flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600">Applied:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedApp.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    selectedApp.status
                  )}`}
                >
                  {getStatusIcon(selectedApp.status)}
                  {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
