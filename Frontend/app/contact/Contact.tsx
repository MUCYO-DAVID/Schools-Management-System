"use client"

import type React from "react"
import { useState } from "react"
import { Mail, MapPin, Send, CheckCircle2, ArrowUpRight } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import { BACKEND_URL } from "@/lib/backend"

const subjectLabelKeys: Record<string, string> = {
  general: "contact.subjectGeneralShort",
  pilot: "contact.subjectPilot",
  registration: "contact.subjectRegistrationInterest",
  feedback: "contact.subjectFeedback",
  other: "contact.subjectOther",
}

const subjectOptions = [
  { value: "general" },
  { value: "pilot" },
  { value: "registration" },
  { value: "feedback" },
  { value: "other" },
] as const

const inputClass =
  "w-full rounded-lg border-0 bg-slate-100/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-1 ring-slate-200/80 transition placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/40 dark:bg-slate-800/50 dark:text-white dark:ring-white/10 dark:placeholder:text-slate-500"

export default function Contact() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${BACKEND_URL}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error("Failed to send message")

      setSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      console.error(err)
      setError(t("contact.couldNotSendMessage"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="page-shell">
      <Navigation />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:max-w-lg sm:py-16">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400">
            {t("contact.earlyAccessBadge")}
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {t("contact")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("contact.contactIntro")}
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-4 text-sm">
          <a
            href="mailto:hello@rsbs.rw"
            className="inline-flex items-center gap-1.5 text-slate-600 transition hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400"
          >
            <Mail className="h-4 w-4 shrink-0 opacity-60" />
            hello@rsbs.rw
            <ArrowUpRight className="h-3 w-3 opacity-40" />
          </a>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <MapPin className="h-4 w-4 shrink-0 opacity-60" />
            Kigali
          </span>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-emerald-500/5 px-6 py-10 text-center ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">{t("contact.messageSent")}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("contact.messageSentFollowUp")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-center text-xs text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t("contact.namePlaceholder")}
                className={inputClass}
              />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t("contact.emailPlaceholder")}
                className={inputClass}
              />
            </div>

            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className={`${inputClass} text-slate-500 dark:text-slate-400`}
            >
              <option value="">{t("contact.whatsThisAbout")}</option>
              {subjectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(subjectLabelKeys[opt.value])}
                </option>
              ))}
            </select>

            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              required
              placeholder={t("contact.yourMessagePlaceholder")}
              className={`${inputClass} resize-none`}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
                  {t("contact.sending")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t("contact.send")}
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          {t("contact.pilotSchoolsTarget")}
        </p>
      </main>
    </div>
  )
}
