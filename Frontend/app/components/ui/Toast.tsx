import React, { useEffect, useState } from 'react'
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { cn } from '../../utils/cn'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps extends Toast {
  onClose: (id: string) => void
}

const ToastItem = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, message, type, duration = 4000, action, onClose }, ref) => {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose(id), 300)
      }, duration)

      return () => clearTimeout(timer)
    }, [duration, id, onClose])

    const getIcon = () => {
      switch (type) {
        case 'success':
          return <CheckCircle className="h-5 w-5" />
        case 'error':
          return <AlertCircle className="h-5 w-5" />
        case 'warning':
          return <AlertCircle className="h-5 w-5" />
        case 'info':
          return <Info className="h-5 w-5" />
        default:
          return null
      }
    }

    const getColors = () => {
      switch (type) {
        case 'success':
          return 'bg-success/10 border-success/20 text-success'
        case 'error':
          return 'bg-destructive/10 border-destructive/20 text-destructive'
        case 'warning':
          return 'bg-warning/10 border-warning/20 text-warning'
        case 'info':
          return 'bg-primary/10 border-primary/20 text-primary'
        default:
          return 'bg-muted border-border'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-4 right-4 max-w-md p-4 rounded-lg border flex items-start gap-3 transition-all duration-300 shadow-lg',
          getColors(),
          isVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        )}
        role="alert"
      >
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-medium hover:underline whitespace-nowrap"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose(id), 300)
          }}
          className="flex-shrink-0 text-current hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
ToastItem.displayName = 'ToastItem'

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-0 right-0 z-50 pointer-events-none">
      <div className="p-4 space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  )
}

export { ToastItem }
