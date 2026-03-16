'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Users, Calendar, BookOpen, GraduationCap, Star, Mail, Phone, Globe, Clock, User, Building2, DollarSign, FileText, CheckCircle, Shirt, Image as ImageIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import type { School } from '../types';
import { fetchGalleries, fetchGallery } from '../api/galleries';

interface SchoolDetails {
  description?: string;
  facilities?: string;
  programs?: string;
  admission_requirements?: string;
  fees_info?: string;
  uniform_info?: string;
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
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'details' | 'contact'>('overview');
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchSchoolDetails();
    fetchGalleryImages();
  }, [school.id]);

  const fetchSchoolDetails = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/schools/${school.id}/details`);
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

  const fetchGalleryImages = async () => {
    try {
      const galleries = await fetchGalleries({ school_id: school.id });
      const allImages: string[] = [];
      
      // Fetch items from all galleries
      for (const gallery of galleries) {
        try {
          const galleryData = await fetchGallery(gallery.id);
          if (galleryData.items) {
            galleryData.items.forEach((item: any) => {
              if (item.media_type === 'photo' && item.media_url) {
                allImages.push(item.media_url);
              }
            });
          }
        } catch (err) {
          console.error('Error fetching gallery items:', err);
        }
      }
      
      setGalleryImages(allImages);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    }
  };

  const average = school.average_rating && school.average_rating > 0 ? school.average_rating : 0;
  const rounded = Math.round(average * 2) / 2;

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [currentImagePage, setCurrentImagePage] = useState(0);
  const imagesPerPage = 4;
  const allImages = galleryImages.length > 0 ? galleryImages : (school.image_urls || []);
  const totalImagePages = Math.ceil(allImages.length / imagesPerPage);
  const currentImages = allImages.slice(currentImagePage * imagesPerPage, (currentImagePage + 1) * imagesPerPage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4 shadow-2xl">
        {/* Compact Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-10 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{school.name}</h2>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{school.location}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                school.type === "Public" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              }`}>
                {school.type}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Compact Quick Stats Bar */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
              <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">{school.students.toLocaleString()}</div>
              <div className="text-[10px] text-gray-600">Students</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
              <Calendar className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">{school.established}</div>
              <div className="text-[10px] text-gray-600">Established</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-100">
              <Star className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
              <div className="text-sm font-bold text-gray-900">{average.toFixed(1)}</div>
              <div className="text-[10px] text-gray-600">Rating</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-100">
              <GraduationCap className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <div className="text-xs font-bold text-gray-900">{school.level}</div>
              <div className="text-[10px] text-gray-600">Level</div>
            </div>
          </div>

          {/* Compact Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-2 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              {allImages.length > 0 && (
                <button
                  onClick={() => {
                    setActiveTab('gallery');
                    setCurrentImagePage(0);
                  }}
                  className={`py-2 px-2 border-b-2 font-medium text-xs transition-colors ${
                    activeTab === 'gallery'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gallery ({allImages.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-2 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-2 px-2 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === 'contact'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Rating */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= rounded
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{average.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Based on {school.rating_count ?? 0} {school.rating_count === 1 ? 'rating' : 'ratings'}</div>
                  </div>
                </div>

                {/* Basic Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">School Type</div>
                      <div className="text-gray-700">{school.type}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Education Level</div>
                      <div className="text-gray-700">{school.level}</div>
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                {details?.description && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      About
                    </h4>
                    <p className="text-gray-700 text-sm line-clamp-3">{details.description}</p>
                    <button
                      onClick={() => setActiveTab('details')}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-2"
                    >
                      Read more →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Gallery Tab with Pagination */}
            {activeTab === 'gallery' && (
              <div>
                {allImages.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {currentImages.map((imageUrl, index) => {
                        const globalIndex = currentImagePage * imagesPerPage + index;
                        return (
                          <div
                            key={globalIndex}
                            className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square"
                            onClick={() => setSelectedImageIndex(globalIndex)}
                          >
                            <img
                              src={galleryImages.length > 0 ? `${backendUrl}${imageUrl}` : imageUrl}
                              alt={`${school.name} image ${globalIndex + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalImagePages > 1 && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <button
                          onClick={() => setCurrentImagePage((prev) => Math.max(0, prev - 1))}
                          disabled={currentImagePage === 0}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        <span className="text-sm text-gray-600 font-medium">
                          Page {currentImagePage + 1} of {totalImagePages}
                        </span>
                        <button
                          onClick={() => setCurrentImagePage((prev) => Math.min(totalImagePages - 1, prev + 1))}
                          disabled={currentImagePage === totalImagePages - 1}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-white rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No images available</p>
                  </div>
                )}
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : details ? (
                  <>
                    {/* Description */}
                    {details.description && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" />
                          About the School
                        </h3>
                        <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{details.description}</p>
                      </div>
                    )}

                    {/* Facilities */}
                    {details.facilities && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Facilities
                        </h3>
                        <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{details.facilities}</p>
                      </div>
                    )}

                    {/* Programs */}
                    {details.programs && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          Programs Offered
                        </h3>
                        <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{details.programs}</p>
                      </div>
                    )}

                    {/* Admission Requirements */}
                    {details.admission_requirements && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                          Admission Requirements
                        </h3>
                        <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{details.admission_requirements}</p>
                      </div>
                    )}

                    {/* Fees Information */}
                    {details.fees_info && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          Fees Information
                        </h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">{details.fees_info}</p>
                        </div>
                      </div>
                    )}

                    {/* Uniform Information */}
                    {details.uniform_info && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                          <Shirt className="w-4 h-4 text-blue-600" />
                          Uniform Requirements
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">{details.uniform_info}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No additional details available for this school yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : details ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {details.principal_name && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Principal</div>
                          <div className="font-medium text-gray-900 text-sm">{details.principal_name}</div>
                        </div>
                      </div>
                    )}
                    {details.contact_email && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Email</div>
                          <a href={`mailto:${details.contact_email}`} className="font-medium text-blue-600 hover:underline text-sm">
                            {details.contact_email}
                          </a>
                        </div>
                      </div>
                    )}
                    {details.contact_phone && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Phone</div>
                          <a href={`tel:${details.contact_phone}`} className="font-medium text-gray-900 text-sm">
                            {details.contact_phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {details.website && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Website</div>
                          <a href={details.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline text-sm">
                            {details.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {details.address && (
                      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Address</div>
                          <div className="font-medium text-gray-900 text-sm">{details.address}</div>
                        </div>
                      </div>
                    )}
                    {details.working_hours && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Working Hours</div>
                          <div className="font-medium text-gray-900 text-sm">{details.working_hours}</div>
                        </div>
                      </div>
                    )}
                    {!details.principal_name && !details.contact_email && !details.contact_phone && !details.website && !details.address && !details.working_hours && (
                      <div className="text-center py-6 col-span-2">
                        <p className="text-gray-500 text-sm">No contact information available for this school yet.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No contact information available for this school yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {onApply && (
            <div className="border-t pt-4 mt-4 flex gap-2">
              <button
                onClick={onApply}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
              >
                Apply to This School
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-5xl w-full h-full flex items-center justify-center">
            <img
              src={
                galleryImages.length > 0
                  ? `${backendUrl}${allImages[selectedImageIndex]}`
                  : allImages[selectedImageIndex] || ''
              }
              alt={`${school.name} image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => {
                  setSelectedImageIndex((selectedImageIndex - 1 + allImages.length) % allImages.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setSelectedImageIndex((selectedImageIndex + 1) % allImages.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
