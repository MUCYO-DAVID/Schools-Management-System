"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

const translations = {
  en: {
    home: "Home",
    schools: "Schools",
    contact: "Contact",
    about: "About",
    admin: "Admin Dashboard",
    student: "Student Access",
    welcome: "Welcome to Rwanda School Bridge System",
    addSchool: "Add New School",
    editSchool: "Edit School",
    deleteSchool: "Delete School",
    schoolName: "School Name",
    location: "Location",
    type: "Type",
    level: "Level",
    students: "Students",
    established: "Established",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    search: "Search schools...",
    filter: "Filter",
    all: "All",
    public: "Public",
    private: "Private",
    primary: "Primary",
    secondary: "Secondary",
    schoolManagement: "School Management",
    studentAccess: "Student Access",
    educationalResources: "Educational Resources",
    qualityAssurance: "Quality Assurance",
    empoweringEducation: "Empowering Education in Rwanda",
    ourServices: "Our Services",
    comprehensiveSolutions: "Comprehensive solutions for educational management",
    registeredSchools: "Registered Schools",
    districtsCovered: "Districts Covered",
  },
  rw: {
    home: "Ahabanza",
    schools: "Amashuri",
    contact: "Twandikire",
    about: "Ibibazo",
    admin: "Ubuyobozi",
    student: "Abanyeshuri",
    welcome: "Murakaza neza kuri Sisitemu y'Ubuyobozi bw'Amashuri y'u Rwanda",
    addSchool: "Ongeraho Ishuri",
    dashboard: "Dashibodi",
    editSchool: "Hindura Ishuri",
    deleteSchool: "Siba Ishuri",
    schoolName: "Izina ry'Ishuri",
    location: "Ahantu",
    type: "Ubwoko",
    level: "Urwego",
    students: "Abanyeshuri",
    established: "Rwashingwa",
    actions: "Ibikorwa",
    edit: "Hindura",
    delete: "Siba",
    save: "Bika",
    cancel: "Hagarika",
    confirm: "Emeza",
    search: "Shakisha amashuri...",
    filter: "Shungura",
    all: "Byose",
    public: "Leta",
    private: "Bwite",
    primary: "Abanza",
    secondary: "Ayisumbuye",
    schoolManagement: "Ubuyobozi bw'Ishuri",
    studentAccess: "Kwinjira kw'Abanyeshuri",
    educationalResources: "Ibikoresho by'Uburezi",
    qualityAssurance: "Ubwiza bw'Uburezi",
    empoweringEducation: "Gutera Imbaraga Uburezi mu Rwanda",
    ourServices: "Serivisi Zacu",
    comprehensiveSolutions: "Igisubizo cyuzuye cyo gucunga uburezi",
    registeredSchools: "Amashuri Yanditswe",
    districtsCovered: "Uturere Twakozweho",
    FindinformationaboutschoolsacrossRwanda: "Shaka amakuru y' ishuri Mu gihugu cyose",

  },
}

interface LanguageContextType {
  language: "en" | "rw"
  setLanguage: (lang: "en" | "rw") => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<"en" | "rw">("en")

  const t = (key: string) => translations[language][key as keyof typeof translations.en] || key

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
