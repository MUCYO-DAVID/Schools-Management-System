import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  description?: string
  closeable?: boolean
  onClose?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, description, closeable = false, onClose, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    const variantStyles = {
      info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-600 dark:text-blue-400',
      },
      success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-200',
        icon: 'text-green-600 dark:text-green-400',
      },
      warning: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-200',
        icon: 'text-amber-600 dark:text-amber-400',
      },
      error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-600 dark:text-red-400',
      },
    }

    const styles = variantStyles[variant]
    const Icon = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertCircle,
    }[variant]

    if (!isVisible) return null

    const handleClose = () => {
      setIsVisible(false)
      onClose?.()
    }

    return (
      <div
        ref={ref}
        className={`rounded-lg border p-4 ${styles.bg} ${styles.border} ${className || ''}`}
        {...props}
      >
        <div className="flex gap-3">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
          <div className="flex-1">
            {title && (
              <h3 className={`font-semibold ${styles.text}`}>{title}</h3>
            )}
            {description && (
              <p className={`text-sm mt-1 ${styles.text}`}>{description}</p>
            )}
            {children && (
              <div className={`text-sm mt-2 ${styles.text}`}>{children}</div>
            )}
          </div>
          {closeable && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-2"
              aria-label="Close alert"
            >
              <X className={`w-5 h-5 ${styles.icon}`} />
            </button>
          )}
        </div>
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export default Alert
