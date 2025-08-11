"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { School } from "../types"
import { useLanguage } from "../providers/LanguageProvider"

interface SchoolModalProps {
  school: School | null
  onSave: (school: Omit<School, "id">) => void
  onClose: () => void
}

export default function SchoolModal({ school, onSave, onClose }: SchoolModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    nameRw: "",
    location: "",
    type: "Public" as "Public" | "Private",
    level: "Primary" as "Primary" | "Secondary" | "Primary & Secondary",
    students: 0,
    established: new Date().getFullYear(),
  })

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        nameRw: school.nameRw,
        location: school.location,
        type: school.type,
        level: school.level,
        students: school.students,
        established: school.established,
      })
    }
  }, [school])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "students" || name === "established" ? Number.parseInt(value) || 0 : value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{school ? t("editSchool") : t("addSchool")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("schoolName")} (English)</label>
            <input
              aria-label=""
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("schoolName")} (Kinyarwanda)</label>
            <input
              type="text"
              name="nameRw"
              value={formData.nameRw}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("location")}</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("type")}</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Public">{t("public")}</option>
              <option value="Private">{t("private")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("level")}</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Primary">{t("primary")}</option>
              <option value="Secondary">{t("secondary")}</option>
              <option value="Primary & Secondary">Primary & Secondary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("students")}</label>
            <input
              type="number"
              name="students"
              value={formData.students}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("established")}</label>
            <input
              type="number"
              name="established"
              value={formData.established}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {t("save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
