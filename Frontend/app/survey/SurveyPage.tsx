"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navigation from "../components/Navigation"
import { BACKEND_URL } from "@/lib/backend"
import { useLanguage } from "../providers/LanguageProvider"

import { Star, Shield, Building2, BookText, MousePointer2, ArrowRight, MessageSquare, CheckCircle2, X, Sparkles } from "lucide-react"

export default function SurveyPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolId = typeof window !== 'undefined' ? searchParams?.get("schoolId") || "" : "";
  const initialRating = typeof window !== 'undefined' ? Number(searchParams?.get("rating") || 0) : 0;

  // States for multiple rating categories
  const [overallRating, setOverallRating] = useState(initialRating)
  const [teachingQuality, setTeachingQuality] = useState(0)
  const [facilitiesQuality, setFacilitiesQuality] = useState(0)
  const [safetyQuality, setSafetyQuality] = useState(0)
  const [easeOfUse, setEaseOfUse] = useState(0)

  const [wouldRecommend, setWouldRecommend] = useState<"yes" | "no" | "">("")
  const [comments, setComments] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!overallRating || !teachingQuality || !facilitiesQuality || !safetyQuality || !easeOfUse || !wouldRecommend) {
      setError(t("survey.completeAllRatings"))
      return
    }

    setError("")
    setSubmitting(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: schoolId || null,
          rating: overallRating,
          would_recommend: wouldRecommend === "yes",
          comments,
          teaching_quality: teachingQuality,
          facilities_quality: facilitiesQuality,
          safety_quality: safetyQuality,
          ease_of_use: easeOfUse
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => router.push("/home"), 2000)
      } else {
        throw new Error("Submission failed")
      }
    } catch (err: any) {
      setError(err.message || t("survey.failedSubmitSurvey"))
    } finally {
      setSubmitting(false)
    }
  }

  const RatingStars = ({ value, onChange, label, icon: Icon }: any) => (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`transition-all duration-200 transform hover:scale-110 ${
              star <= value ? "text-amber-400 scale-105" : "text-slate-400 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-500"
            }`}
          >
            <Star className={`w-8 h-8 ${star <= value ? "fill-amber-400" : ""}`} />
          </button>
        ))}
      </div>
    </div>
  )

  if (success) {
    return (
      <div className="page-shell flex items-center justify-center p-6 text-center">
        <div className="animate-in fade-in zoom-in duration-500">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">{t("survey.thankYou")}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t("survey.feedbackRecorded")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-600/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Navigation />

      <div className="relative z-10 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            {t("survey.schoolExperienceSurvey")}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            {t("survey.howWasExperience")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {t("survey.surveyIntro")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-12 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <div className="md:col-span-2">
                <RatingStars
                  label={t("survey.overallSatisfaction")}
                  icon={Sparkles}
                  value={overallRating}
                  onChange={setOverallRating}
                />
              </div>
              <RatingStars
                label={t("survey.teachingQuality")}
                icon={BookText}
                value={teachingQuality}
                onChange={setTeachingQuality}
              />
              <RatingStars
                label={t("survey.facilitiesEnvironment")}
                icon={Building2}
                value={facilitiesQuality}
                onChange={setFacilitiesQuality}
              />
              <RatingStars
                label={t("survey.safetyStudentSupport")}
                icon={Shield}
                value={safetyQuality}
                onChange={setSafetyQuality}
              />
              <RatingStars
                label={t("survey.easeOfUsingPlatform")}
                icon={MousePointer2}
                value={easeOfUse}
                onChange={setEaseOfUse}
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-4">
                {t("survey.wouldRecommend")}
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setWouldRecommend("yes")}
                  className={`flex-1 group relative flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${
                    wouldRecommend === "yes"
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                      : "bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 transition-transform group-hover:scale-110 ${wouldRecommend === "yes" ? "animate-in zoom-in" : ""}`} />
                  <span className="font-bold">{t("survey.highlyRecommend")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend("no")}
                  className={`flex-1 group relative flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all ${
                    wouldRecommend === "no"
                      ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/20"
                      : "bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <X className={`w-5 h-5 transition-transform group-hover:scale-110 ${wouldRecommend === "no" ? "animate-in zoom-in" : ""}`} />
                  <span className="font-bold">{t("survey.notRecommended")}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-4">
                {t("survey.tellUsMoreOptional")}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-slate-500"
                placeholder={t("survey.commentsPlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full group relative flex items-center justify-center gap-2 py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-600/20 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t("survey.submitting")}</span>
                </div>
              ) : (
                <>
                  {t("survey.submitMyReview")}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
