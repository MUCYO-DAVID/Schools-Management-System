'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Users, Calendar, BookOpen, GraduationCap, Star, Mail, Phone, Globe, Clock, User, Building2, DollarSign, FileText, CheckCircle } from 'lucide-react';
import type { School } from '../types';

interface SchoolDetails {
  description?: string;
  facilities?: string;
  programs?: string;
  admission_requirements?: string;
  fees_info?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  working_hours?: string;
  principal_name?: string;
}

interface SchoolDetailsModalProps {
  school: School;
  onClose: () => void;
  onApply?: () => void;
}

export default function SchoolDetailsModal({ school, onClose, onApply }: SchoolDetailsModalProps) {
  const [details, setDetails] = useState<SchoolDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchoolDetails();
  }, [school.id]);

  const fetchSchoolDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schools/${school.id}/details`
      );
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (error) {
      console.error('Error fetching school details:', error);
    } finally {
      setLoading(false);
    }
  };

  const average = school.average_rating && school.average_rating > 0 ? school.average_rating : 0;
  const rounded = Math.round(average * 2) / 2;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto my-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{school.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{school.location}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  school.type === "Public" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {school.type}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Images */}
          {school.image_urls && school.image_urls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {school.image_urls.slice(0, 4).map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`${school.name} image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= rounded
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">{average.toFixed(1)}</span>
            <span className="text-sm text-gray-600">({school.rating_count ?? 0} ratings)</span>
          </div>

          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Total Students</div>
                <div className="text-gray-600">{school.students.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Established</div>
                <div className="text-gray-600">{school.established}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">School Type</div>
                <div className="text-gray-600">{school.type}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Education Level</div>
                <div className="text-gray-600">{school.level}</div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : details ? (
            <>
              {/* Description */}
              {details.description && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    About the School
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{details.description}</p>
                </div>
              )}

              {/* Facilities */}
              {details.facilities && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Facilities
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{details.facilities}</p>
                </div>
              )}

              {/* Programs */}
              {details.programs && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Programs Offered
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{details.programs}</p>
                </div>
              )}

              {/* Admission Requirements */}
              {details.admission_requirements && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Admission Requirements
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{details.admission_requirements}</p>
                </div>
              )}

              {/* Fees Information */}
              {details.fees_info && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    Fees Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{details.fees_info}</p>
                </div>
              )}

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.principal_name && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Principal</div>
                        <div className="font-medium text-gray-900">{details.principal_name}</div>
                      </div>
                    </div>
                  )}
                  {details.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <a href={`mailto:${details.contact_email}`} className="font-medium text-blue-600 hover:underline">
                          {details.contact_email}
                        </a>
                      </div>
                    </div>
                  )}
                  {details.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <a href={`tel:${details.contact_phone}`} className="font-medium text-gray-900">
                          {details.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {details.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Website</div>
                        <a href={details.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                          {details.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {details.address && (
                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm text-gray-600">Address</div>
                        <div className="font-medium text-gray-900">{details.address}</div>
                      </div>
                    </div>
                  )}
                  {details.working_hours && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Working Hours</div>
                        <div className="font-medium text-gray-900">{details.working_hours}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="border-t pt-6 text-center py-8">
              <p className="text-gray-500">No additional details available for this school yet.</p>
            </div>
          )}

          {/* Action Buttons */}
          {onApply && (
            <div className="border-t pt-6 flex gap-3">
              <button
                onClick={onApply}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Apply to This School
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
