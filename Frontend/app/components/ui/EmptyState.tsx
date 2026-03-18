import React from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "./Button"
import { cn } from "../../utils/cn"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function NoResultsEmptyState({
  searchQuery,
  onClear,
}: {
  searchQuery: string
  onClear: () => void
}) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12 text-muted-foreground" />}
      title="No results found"
      description={`We couldn't find any results for "${searchQuery}". Try adjusting your search terms.`}
      action={{
        label: "Clear search",
        onClick: onClear,
      }}
    />
  )
}

export function NoDataEmptyState({
  title = "No data yet",
  description = "Get started by creating your first item",
  actionLabel = "Create",
  onAction,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <EmptyState
      icon={<Plus className="h-12 w-12 text-muted-foreground" />}
      title={title}
      description={description}
      action={onAction ? { label: actionLabel, onClick: onAction } : undefined}
    />
  )
}
