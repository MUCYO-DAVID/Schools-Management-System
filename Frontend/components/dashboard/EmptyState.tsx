import React from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  fullHeight?: boolean
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  fullHeight = false,
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      {icon && (
        <div className="p-4 bg-muted rounded-lg">
          {React.cloneElement(icon as React.ReactElement, {
            className: 'w-12 h-12 text-muted-foreground',
          })}
        </div>
      )}
      <div className="text-center">
        <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button
          variant="primary"
          size="md"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )

  if (fullHeight) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {content}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-12">
        {content}
      </CardContent>
    </Card>
  )
}
