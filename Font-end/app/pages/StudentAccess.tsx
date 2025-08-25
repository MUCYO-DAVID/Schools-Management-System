"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, MapPin, Users, Calendar, BookOpen, GraduationCap } from "lucide-react"
import type { School } from "../types"
import { useLanguage } from "../providers/LanguageProvider"
import { fetchSchools } from "@/api/school";

interface StudentAccessProps {
  schools?: School[] // optional: if parent passes schools we use them, otherwise fetch from API
}

export default function StudentAccess({ schools: initialSchools }: StudentAccessProps) {
  const language = useLanguage() as unknown as { t: (key: string) => string, language: string }
  const { t } = language
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [schools, setSchools] = useState<School[]>(initialSchools ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  // Fetch schools from backend if parent did not provide them
  const loadSchools = useCallback(async () => {
    if (initialSchools && initialSchools.length) return
    setLoading(true)
    setError(null)
    setErrorDetails(null)
    try {
      // Prefer the shared API helper if available; fallback to direct URL if helper throws.
      let data
      try {
        data = await fetchSchools()
      } catch (helperErr) {
        // helper failed — fallback to explicit fetch (keeps parity with Schools page)
        console.warn("fetchSchools helper failed, falling back to direct fetch:", helperErr)
        const res = await fetch("http://localhost:5000/api/schools")
        if (!res.ok) {
          const bodyText = await res.text().catch(() => "")
          const msg = `Fetch error ${res.status} ${res.statusText} - ${bodyText}`
          throw new Error(msg)
        }
        data = await res.json()
      }

      setSchools(Array.isArray(data) ? data : [])
    } catch (err: any) {
      // Surface full details to console and to UI for easier debugging
      console.error("Failed to load schools (StudentAccess):", err)
      setError("Unable to load schools")
      setErrorDetails(err?.message ? String(err.message) : String(err))
    } finally {
      setLoading(false)
    }
  }, [initialSchools])

  useEffect(() => {
    let mounted = true
    if (!mounted) return
    loadSchools()
    return () => {
      mounted = false
    }
  }, [initialSchools, loadSchools])

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // show simple loading / error states inside the component
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading schools…</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">
          <div className="mb-2">{error}</div>
          {errorDetails && (
            <pre className="text-left whitespace-pre-wrap max-w-xl mx-auto bg-gray-100 p-3 rounded text-sm text-gray-700">
              {errorDetails}
            </pre>
          )}
          <div className="mt-4">
            <button
              onClick={() => loadSchools()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
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
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedSchool(school)}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {language.language === "rw" ? school.nameRw : school.name}
              </h3>

              <div className="space-y-3 mb-4">
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

              <div className="flex gap-2">
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
                    {language.language === "rw" ? selectedSchool.nameRw : selectedSchool.name}
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
                  For more information about this school, please contact the school administration directly or visit the
                  Rwanda Education Board website.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
