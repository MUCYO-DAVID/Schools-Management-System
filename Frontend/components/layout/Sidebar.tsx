'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  School,
  DollarSign,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  FileText,
  Map,
} from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useLanguage } from '@/app/providers/LanguageProvider'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: string[]
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      href: '/schools',
      label: 'Schools',
      icon: <School className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      href: '/students',
      label: 'Students',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin', 'teacher'],
    },
    {
      href: '/teachers',
      label: 'Teachers',
      icon: <GraduationCap className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      href: '/classes',
      label: 'Classes',
      icon: <School className="w-5 h-5" />,
      roles: ['admin', 'teacher'],
    },
    {
      href: '/payments',
      label: 'Payments',
      icon: <DollarSign className="w-5 h-5" />,
      roles: ['admin', 'parent'],
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['admin', 'teacher'],
    },
    {
      href: '/calendar',
      label: 'Calendar',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      href: '/announcements',
      label: 'Announcements',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      roles: ['admin', 'teacher'],
    },
  ]

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(user?.role || '')
  })

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className={`flex items-center justify-between h-16 px-4 border-b border-border`}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <School className="w-6 h-6" />
            <span className="truncate">SchoolHub</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-1 hover:bg-muted rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-muted'
            }`}
            title={isCollapsed ? item.label : ''}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className={`border-t border-border p-2 space-y-2`}>
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted ${
            isActive('/profile') ? 'bg-primary text-primary-foreground' : ''
          }`}
          title={isCollapsed ? 'Profile' : ''}
        >
          <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
            </div>
          )}
        </Link>

        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted ${
            isActive('/settings') ? 'bg-primary text-primary-foreground' : ''
          }`}
          title={isCollapsed ? 'Settings' : ''}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
