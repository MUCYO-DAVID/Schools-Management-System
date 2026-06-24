"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import en from "@/locales/en.json"
import fr from "@/locales/fr.json"
import rw from "@/locales/rw.json"

type Language = "en" | "fr" | "rw"

const locales: Record<Language, Record<string, unknown>> = { en, fr, rw }

// Flat-key aliases for backward compatibility with existing t("home") calls
const flatAliases: Record<string, string> = {
  home: "nav.home",
  about: "nav.about",
  contact: "nav.contact",
  schools: "nav.schools",
  admin: "nav.admin",
  student: "nav.student",
  survey: "nav.survey",
  community: "nav.community",
  students: "schools.students",
  established: "schools.established",
  search: "schools.search",
  all: "schools.all",
  public: "schools.public",
  private: "schools.private",
  primary: "schools.primary",
  secondary: "schools.secondary",
  tvet: "schools.tvet",
  addSchool: "schools.addSchool",
  editSchool: "schools.editSchool",
  deleteSchool: "schools.deleteSchool",
  schoolName: "schools.schoolName",
  location: "schools.location",
  type: "schools.type",
  level: "schools.level",
  save: "common.save",
  cancel: "common.cancel",
  confirm: "common.confirm",
  edit: "common.edit",
  delete: "common.delete",
  close: "common.close",
  submit: "common.submit",
  upload: "common.upload",
  download: "common.download",
  filter: "common.filter",
  loading: "common.loading",
  dashboard: "nav.dashboard",
  welcome: "home.welcome",
  addNewSchool: "admin.addNewSchool",
  schoolManagement: "home.schoolManagement",
  studentAccess: "home.studentAccess",
  educationalResources: "home.educationalResources",
  qualityAssurance: "home.qualityAssurance",
  empoweringEducation: "home.empoweringEducation",
  ourServices: "home.ourServices",
  comprehensiveSolutions: "home.comprehensiveSolutions",
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === "string" ? current : undefined
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`))
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const locale = locales[language]

    // Try dot-notation first (e.g. "nav.home", "auth.login.title")
    let value = getNestedValue(locale, key)

    // Fall back to flat alias map (e.g. "home" → "nav.home")
    if (value === undefined && flatAliases[key]) {
      value = getNestedValue(locale, flatAliases[key])
    }

    // Fall back to English if translation missing
    if (value === undefined && language !== "en") {
      value = getNestedValue(locales.en, key)
      if (value === undefined && flatAliases[key]) {
        value = getNestedValue(locales.en, flatAliases[key])
      }
    }

    return interpolate(value ?? key, vars)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
