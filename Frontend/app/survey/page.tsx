"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navigation from "../components/Navigation"

export default function SurveyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolId = searchParams?.get("schoolId") || ""
  const [rating] = useState<number | null>(null) // rating already done on previous step
  const [wouldRecommend, setWouldRecommend] = useState<"yes" | "no" | "">("")
  const [comments, setComments] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: schoolId || null,
          rating: rating,
          would_recommend: wouldRecommend === "yes",
          comments,
        }),
      })
      router.push("/schools")
    } catch (err: any) {
      setError(err.message || "Failed to submit survey")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 mx-auto mt-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Thank you for your rating
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Please take a moment to complete this short survey and help us improve school recommendations.
        </p>

        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Would you recommend this school to others?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setWouldRecommend("yes")}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${
                  wouldRecommend === "yes"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend("no")}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium ${
                  wouldRecommend === "no"
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                No
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any additional feedback?
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Share any thoughts about the school or the platform..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Survey"}
          </button>
        </form>
      </div>
    </div>
  )
}


