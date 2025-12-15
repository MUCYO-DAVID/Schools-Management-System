"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { School as SchoolIcon, Users, BookOpen, Award, Star } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import type { School } from "../types"
import { fetchTopSchools, rateSchool } from "@/api/school"

export default function Home() {
  const { t } = useLanguage()
  const router = useRouter()
  const [topSchools, setTopSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [ratingSchoolId, setRatingSchoolId] = useState<string | null>(null)

  useEffect(() => {
    const loadTopSchools = async () => {
      try {
        const data = await fetchTopSchools(4)
        setTopSchools(data)
      } catch (err) {
        console.error("Error loading top schools", err)
      } finally {
        setLoading(false)
      }
    }
    loadTopSchools()
  }, [])

  const handleRate = async (schoolId: string, value: number) => {
    try {
      setRatingSchoolId(schoolId)
      await rateSchool(schoolId, value)
      router.push(`/survey?schoolId=${schoolId}`)
    } catch (err) {
      console.error("Failed to rate school", err)
      setRatingSchoolId(null)
    }
  }

  const features = [
    {
      icon: SchoolIcon,
      title: "School Management",
      titleRw: "Ubuyobozi bw'Amashuri",
      description: "Comprehensive school administration system",
      descriptionRw: "Sisitemu y'ubuyobozi bw'amashuri yuzuye",
    },
    {
      icon: Users,
      title: "Student Access",
      titleRw: "Abanyeshuri",
      description: "Easy access to school information for students",
      descriptionRw: "Kubona amakuru y'ishuri byoroshye ku banyeshuri",
    },
    {
      icon: BookOpen,
      title: "Educational Resources",
      titleRw: "Ibikoresho by'Uburezi",
      description: "Access to learning materials and resources",
      descriptionRw: "Kubona ibikoresho by'kwiga n'ubundi buryo",
    },
    {
      icon: Award,
      title: "Quality Assurance",
      titleRw: "Ubwiza bw'Uburezi",
      description: "Ensuring high standards in education",
      descriptionRw: "Kwemeza ko uburezi buri ku rwego rwo hejuru",
    },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("welcome")}</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">Empowering Education in Rwanda</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/schools"
                className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                {t("schools")}
              </Link>
              <Link
                href="/student"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                {t("student")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Schools Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Most Recommended Schools
              </h2>
              <p className="text-gray-600">
                Discover highly rated schools based on community feedback.
              </p>
            </div>
            <Link
              href="/schools"
              className="hidden sm:inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all schools
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading top schools...</p>
          ) : topSchools.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No schools have been rated yet. Be the first to add and rate a school!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topSchools.map((school) => {
                const average =
                  school.average_rating && school.average_rating > 0
                    ? school.average_rating
                    : 0
                const rounded = Math.round(average * 2) / 2

                return (
                  <div
                    key={school.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    {school.image_urls && school.image_urls.length > 0 && (
                      <div className="h-32 w-full overflow-hidden">
                        <img
                          src={school.image_urls[0]}
                          alt={school.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {school.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{school.location}</p>

                      <div className="flex items-center mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRate(school.id, star)}
                            className="mr-1"
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            <Star
                              className={`w-4 h-4 ${star <= rounded ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs text-gray-500">
                          {school.rating_count ?? 0} rating
                          {(school.rating_count ?? 0) === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {school.type}
                        </span>
                        <Link
                          href="/schools"
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive solutions for educational management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Registered Schools</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50,000+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-600 mb-2">30</div>
              <div className="text-gray-600">Districts Covered</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
