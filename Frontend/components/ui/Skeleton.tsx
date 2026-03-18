import React from 'react'

export interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'table'
  count?: number
  height?: string
  width?: string
  className?: string
}

export default function Skeleton({
  variant = 'text',
  count = 1,
  height = '1rem',
  width = '100%',
  className = '',
}: SkeletonProps) {
  const baseClasses = 'bg-muted animate-pulse rounded'

  const variants = {
    text: `${baseClasses} h-4`,
    card: `${baseClasses} h-48`,
    avatar: `${baseClasses} h-10 w-10 rounded-full`,
    button: `${baseClasses} h-10`,
    table: `${baseClasses} h-full`,
  }

  const selectedClasses = variants[variant] || variants.text

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} p-6 space-y-4 ${className}`}>
        <div className="h-4 bg-muted rounded" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-4/6" />
        </div>
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-muted rounded">
              <div className="h-10 w-10 bg-muted-foreground/10 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted-foreground/10 rounded w-1/4" />
                <div className="h-3 bg-muted-foreground/10 rounded w-1/3" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={selectedClasses}
            style={{
              height: variant === 'text' ? '0.875rem' : height,
              width: width,
            }}
          />
        ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div className="h-6 bg-muted rounded w-1/3" />
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
      <div className="pt-4 flex gap-2">
        <div className="h-10 bg-muted rounded w-24 flex-shrink-0" />
        <div className="h-10 bg-muted rounded w-24 flex-shrink-0" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex p-4 bg-muted border-b border-border gap-4">
        <div className="h-4 bg-muted-foreground/20 rounded flex-1" />
        <div className="h-4 bg-muted-foreground/20 rounded flex-1" />
        <div className="h-4 bg-muted-foreground/20 rounded flex-1" />
      </div>
      {/* Rows */}
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex p-4 border-b border-border gap-4">
            <div className="h-4 bg-muted rounded flex-1" />
            <div className="h-4 bg-muted rounded flex-1" />
            <div className="h-4 bg-muted rounded flex-1" />
          </div>
        ))}
    </div>
  )
}
