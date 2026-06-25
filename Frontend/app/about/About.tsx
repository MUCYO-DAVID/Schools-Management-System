"use client"

import { Award, Target, Users, Globe, BookOpen, Shield } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"

export default function About() {
  const { t } = useLanguage()

  const values = [
    {
      icon: Award,
      titleKey: "about.excellence",
      descKey: "about.excellenceDesc",
    },
    {
      icon: Target,
      titleKey: "about.innovation",
      descKey: "about.innovationDesc",
    },
    {
      icon: Users,
      titleKey: "about.collaboration",
      descKey: "about.collaborationDesc",
    },
    {
      icon: Globe,
      titleKey: "about.accessibility",
      descKey: "about.accessibilityDesc",
    },
    {
      icon: BookOpen,
      titleKey: "about.learning",
      descKey: "about.learningDesc",
    },
    {
      icon: Shield,
      titleKey: "about.trust",
      descKey: "about.trustDesc",
    },
  ]

  return (
    <div className="page-shell">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">{t("about.title")}</h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            {t("about.subtitle")}
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-900 to-green-700 text-white rounded-2xl p-5 sm:p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">{t("about.ourMission")}</h2>
                <p className="text-lg text-blue-100 mb-6">
                  {t("about.missionText")}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">500+</div>
                    <div className="text-blue-100">{t("about.schoolsServed")}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">50K+</div>
                    <div className="text-blue-100">{t("about.studentsImpacted")}</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="w-64 h-64 bg-white bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-32 h-32 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("about.ourValues")}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("about.valuesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t(value.titleKey)}</h3>
                <p className="text-gray-600">{t(value.descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="mb-16">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("about.ourStory")}</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    {t("about.storyParagraph1")}
                  </p>
                  <p>
                    {t("about.storyParagraph2")}
                  </p>
                  <p>
                    {t("about.storyParagraph3")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">2020</div>
                  <div className="text-sm text-gray-600">{t("about.founded")}</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">100+</div>
                  <div className="text-sm text-gray-600">{t("about.firstSchools")}</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">2022</div>
                  <div className="text-sm text-gray-600">{t("about.nationalRollout")}</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">500+</div>
                  <div className="text-sm text-gray-600">{t("about.schoolsToday")}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Section */}
        <section>
          <div className="bg-gradient-to-r from-green-700 to-blue-900 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("about.ourPartners")}</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              {t("about.partnersSubtitle")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">{t("about.rebPartnerTitle")}</h3>
                <p className="text-blue-100">
                  {t("about.rebPartnerDesc")}
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">{t("about.nesaPartnerTitle")}</h3>
                <p className="text-blue-100">{t("about.nesaPartnerDesc")}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
