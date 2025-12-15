"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Users, Calendar, BookOpen, GraduationCap, Star } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import type { School } from "../types"
import { fetchSchools, rateSchool } from "@/api/school"
const initialSchools: School[] = [
  {
    id: "1",
    name: "Kigali International School",
    nameRw: "Ishuri Mpuzamahanga rya Kigali",
    location: "Kigali",
    type: "Private",
    level: "Primary & Secondary",
    students: 450,
    established: 2010,
    image_urls: [],
  },
  {
    id: "2",
    name: "Rwanda Education Board School",
    nameRw: "Ishuri rya REB",
    location: "Musanze",
    type: "Public",
    level: "Secondary",
    students: 680,
    established: 2005,
    image_urls: [],
  },
]

export default function StudentAccess() {
  const { t, language } = useLanguage()
  const [schools, setSchools] = useState<School[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [ratingSchoolId, setRatingSchoolId] = useState<string | null>(null)

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const schoolsData = await fetchSchools()
        setSchools(schoolsData)
      } catch (error) {
        console.error("Error fetching:", error)
      }
    }
    loadSchools()
  }, [])

  const handleRate = async (schoolId: string, value: number) => {
    try {
      setRatingSchoolId(schoolId)
      await rateSchool(schoolId, value)
      // Optimistically update rating info locally
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
    
  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("student")} Portal</h1>
          <p className="text-gray-600">Find information about schools across Rwanda</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for schools by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* School Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredSchools.map((school) => (
            <div
              key={school.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
              onClick={() => {
                setSelectedSchool(school)
              }}
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
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= rounded
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs text-gray-500">
                          {school.rating_count ?? 0} rating
                          {(school.rating_count ?? 0) === 1 ? "" : "s"}
                        </span>
                      </>
                    )
                  })()}
                </div>

                <div className="space-y-2 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{school.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {school.students} {t("students")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {t("established")} {school.established}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap className="w-4 h-4" />
                    <span>{school.level}</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      school.type === "Public" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {school.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}

        {/* School Detail Modal */}
        {selectedSchool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {language === "rw" ? selectedSchool.nameRw : selectedSchool.name}
                    </h2>
                    <p className="text-gray-600">{selectedSchool.location}</p>
                  </div>
                  <button onClick={() => setSelectedSchool(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedSchool.image_urls && selectedSchool.image_urls.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {selectedSchool.image_urls.map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`${selectedSchool.name} image ${index + 1}`}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Total Students</div>
                        <div className="text-gray-600">{selectedSchool.students}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Established</div>
                        <div className="text-gray-600">{selectedSchool.established}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">School Type</div>
                        <div className="text-gray-600">{selectedSchool.type}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Education Level</div>
                        <div className="text-gray-600">{selectedSchool.level}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                  <p className="text-gray-600 text-sm">
                    For more information about this school, please contact the school administration directly or visit
                    the Rwanda Education Board website.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
