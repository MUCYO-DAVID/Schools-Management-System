"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Home, Users, BookOpen, Settings, LogOut, Menu, X } from "lucide-react"
import { cn } from "../../utils/cn"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  submenu?: NavItem[]
}

interface SidebarProps {
  items: NavItem[]
  onLogout?: () => void
  onNavigate?: (href: string) => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ items, onLogout, onNavigate, collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleSubmenu = (label: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(label)) {
      newExpanded.delete(label)
    } else {
      newExpanded.add(label)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const isItemActive = isActive(item.href)

    return (
      <div key={item.href}>
        <button
          onClick={() => {
            if (hasSubmenu) {
              toggleSubmenu(item.label)
            } else {
              onNavigate?.(item.href)
            }
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
            isItemActive
              ? "bg-primary/10 text-primary border-l-2 border-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            depth > 0 && "ml-2 border-l-0"
          )}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full">
                  {item.badge}
                </span>
              )}
              {hasSubmenu && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expandedItems.has(item.label) && "rotate-180"
                  )}
                />
              )}
            </>
          )}
        </button>

        {hasSubmenu && expandedItems.has(item.label) && !collapsed && (
          <div className="space-y-1 ml-2 border-l border-border">
            {item.submenu!.map((subitem) => renderNavItem(subitem, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col h-screen",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && <h2 className="text-lg font-bold text-foreground">RSBS</h2>}
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((item) => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-2">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        )}
      </div>
    </aside>
  )
}
