"use client"

import { AlertTriangle } from "lucide-react"
import { useLanguage } from "../providers/LanguageProvider"

interface DeleteConfirmModalProps {
  schoolName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmModal({ schoolName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t("deleteSchool")}</h3>
            <p className="text-gray-600">Are you sure you want to delete "{schoolName}"?</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          This action cannot be undone. All data associated with this school will be permanently removed.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            {t("confirm")}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  )
}
