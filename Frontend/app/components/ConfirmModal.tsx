"use client";

import { AlertCircle, X } from "lucide-react"
import { useLanguage } from "../providers/LanguageProvider"

interface ReactNodeArray extends Array<React.ReactNode> {}
type ReactNode = React.ReactElement | string | number | ReactNodeArray | boolean | null | undefined;

interface ConfirmModalProps {
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({ 
  title, 
  message, 
  confirmText, 
  cancelText, 
  onConfirm, 
  onCancel,
  variant = 'danger' 
}: ConfirmModalProps) {
  const { t } = useLanguage()

  const colors = {
    danger: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/20',
      button: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
    },
    warning: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      border: 'border-amber-500/20',
      button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20'
    },
    info: {
      bg: 'bg-purple-600/10',
      text: 'text-purple-400',
      border: 'border-purple-600/20',
      button: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20'
    }
  }[variant]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
      <div className="bg-[#141418] border border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors.bg} ${colors.border} border`}>
            <AlertCircle className={`w-6 h-6 ${colors.text}`} />
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <h3 className="text-xl font-black text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 px-4 rounded-2xl transition-all border border-white/5"
          >
            {cancelText || t("cancel") || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 font-bold py-3 px-4 rounded-2xl transition-all ${colors.button}`}
          >
            {confirmText || t("confirm") || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
