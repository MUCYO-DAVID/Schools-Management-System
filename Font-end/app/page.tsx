"use client"
import Link from "next/link"
import { School, Users, BookOpen, Award } from "lucide-react"
import Navigation from "./components/Navigation"
import { useLanguage } from "./providers/LanguageProvider"

export default function Home() {
  const { t } = useLanguage()

  const features = [
    {
      icon: School,
      title: t("schoolManagement"),
      description: "Comprehensive school administration system",
    },
    {
      icon: Users,
      title: t("studentAccess"),
      description: "Easy access to school information for students",
    },
    {
      icon: BookOpen,
      title: t("educationalResources"),
      description: "Access to learning materials and resources",
    },
    {
      icon: Award,
      title: t("qualityAssurance"),
      description: "Ensuring high standards in education",
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
            <p className="text-xl md:text-2xl mb-8 text-blue-100">{t("empoweringEducation")}</p>
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
                {t("studentAccess")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("ourServices")}</h2>
            <p className="text-xl text-gray-600">{t("comprehensiveSolutions")}</p>
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
              <div className="text-gray-600">{t("registeredSchools")}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50,000+</div>
              <div className="text-gray-600">{t("students")}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-600 mb-2">30</div>
              <div className="text-gray-600">{t("districtsCovered")}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
