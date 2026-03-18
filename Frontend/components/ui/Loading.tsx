import React from 'react'

export interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'bar'
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
}

export default function Loading({
  variant = 'spinner',
  size = 'md',
  message,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinnerContent = (
    <div className={`${sizeClasses[size]} border-3 border-muted border-t-primary rounded-full animate-spin`} />
  )

  const dotsContent = (
    <div className="flex gap-2">
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
    </div>
  )

  const barContent = (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-primary animate-pulse" style={{ width: '30%' }} />
    </div>
  )

  const content = variant === 'spinner' ? spinnerContent : variant === 'dots' ? dotsContent : barContent

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="text-center">
          {content}
          {message && (
            <p className="mt-4 text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {content}
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  )
}
