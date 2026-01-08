'use client';

import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { getStudentApplications, withdrawApplication, StudentApplication } from '../api/student';
import { formatDistanceToNow } from 'date-fns';

export default function StudentDashboard() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getStudentApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
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
        <p className="text-sm text-gray-600">Start by applying to a school from the student portal</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
        <span className="text-sm text-gray-600">{applications.length} application(s)</span>
      </div>

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
