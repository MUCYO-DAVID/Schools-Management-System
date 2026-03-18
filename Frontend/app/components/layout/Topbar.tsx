"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Bell, Search, Settings, User, LogOut, Menu } from "lucide-react"
import { Avatar } from "../ui/Avatar"
import { cn } from "../../utils/cn"

interface TopbarProps {
  user?: {
    name: string
    email: string
    avatar?: string
    initials?: string
  }
  notifications?: number
  onSettingsClick?: () => void
  onProfileClick?: () => void
  onLogout?: () => void
  onMenuClick?: () => void
  searchPlaceholder?: string
  onSearch?: (query: string) => void
}

export function Topbar({
  user,
  notifications = 0,
  onSettingsClick,
  onProfileClick,
  onLogout,
  onMenuClick,
  searchPlaceholder = "Search...",
  onSearch,
}: TopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6 gap-4">
        {/* Left: Menu button and search */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-muted rounded-md transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-muted rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Right: Notifications, settings, user menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            className="relative p-2 hover:bg-muted rounded-md transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onSettingsClick}
            className="p-2 hover:bg-muted rounded-md transition-colors hidden sm:block"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded-md transition-colors"
            >
              <Avatar
                src={user?.avatar}
                initials={user?.initials || "U"}
                size="sm"
              />
              <div className="hidden sm:block text-left text-sm">
                <p className="font-medium text-foreground">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    onProfileClick?.()
                    setShowUserMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    onSettingsClick?.()
                    setShowUserMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={() => {
                    onLogout?.()
                    setShowUserMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
