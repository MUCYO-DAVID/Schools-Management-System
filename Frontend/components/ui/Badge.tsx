import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  size?: 'sm' | 'md'
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-primary text-primary-foreground',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      error: 'bg-destructive/10 text-destructive',
      warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    }

    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    }

    return (
      <span
        ref={ref}
        className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${
          className || ''
        }`}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
