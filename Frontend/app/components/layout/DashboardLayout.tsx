"use client"

import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { cn } from "../../utils/cn"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  submenu?: NavItem[]
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  user?: {
    name: string
    email: string
    avatar?: string
    initials?: string
  }
  notifications?: number
  onLogout?: () => void
  onNavigate?: (href: string) => void
  onSettingsClick?: () => void
  onProfileClick?: () => void
  searchPlaceholder?: string
  onSearch?: (query: string) => void
}

export function DashboardLayout({
  children,
  navItems,
  user,
  notifications = 0,
  onLogout,
  onNavigate,
  onSettingsClick,
  onProfileClick,
  searchPlaceholder = "Search students, teachers, classes...",
  onSearch,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block">
        <Sidebar
          items={navItems}
          onLogout={onLogout}
          onNavigate={onNavigate}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-16 left-0 w-64 bg-card z-40 border-r border-border transition-transform md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          items={navItems}
          onLogout={onLogout}
          onNavigate={(href) => {
            onNavigate?.(href)
            setMobileMenuOpen(false)
          }}
          collapsed={false}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <Topbar
          user={user}
          notifications={notifications}
          onSettingsClick={onSettingsClick}
          onProfileClick={onProfileClick}
          onLogout={onLogout}
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          searchPlaceholder={searchPlaceholder}
          onSearch={onSearch}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="bg-background">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
