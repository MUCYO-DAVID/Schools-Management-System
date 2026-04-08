"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  BookOpen,
  ChevronRight,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  School,
  Settings,
  Sparkles,
  Sun,
  User,
  Users,
  X,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "../providers/LanguageProvider"
import { useAuth } from "../providers/AuthProvider"
import { fetchInbox, markMessageRead } from "../api/portal"
import ChatWindow from "./ChatWindow"
import { fetchUnreadCount } from "../api/realtime-chat"

type NavItem = {
  path: string
  label: string
  description: string
  icon: typeof LayoutDashboard
}

const roleConfig = {
  admin: {
    label: "Administrator",
    homePath: "/admin",
    accent: "from-violet-500 to-indigo-500",
  },
  leader: {
    label: "School Leader",
    homePath: "/leader",
    accent: "from-blue-500 to-cyan-500",
  },
  teacher: {
    label: "Teacher",
    homePath: "/teacher",
    accent: "from-emerald-500 to-teal-500",
  },
  parent: {
    label: "Parent",
    homePath: "/parent",
    accent: "from-amber-500 to-orange-500",
  },
  student: {
    label: "Student",
    homePath: "/home",
    accent: "from-pink-500 to-rose-500",
  },
} as const

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "RS"

const formatLabelFromPath = (pathname: string) => {
  const label = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/-/g, " "))
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" / ")

  return label || "Dashboard"
}

export default function Navigation() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://rwandaschoolsbridgesystem.onrender.com"
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [inboxPreview, setInboxPreview] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [chatUnreadCount, setChatUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    document.body.classList.add("has-app-shell")

    return () => {
      document.body.classList.remove("has-app-shell")
    }
  }, [])

  useEffect(() => {
    setIsSidebarOpen(false)
    setShowNotifications(false)
  }, [pathname])

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("sidebar-open")
    } else {
      document.body.classList.remove("sidebar-open")
    }
    return () => document.body.classList.remove("sidebar-open")
  }, [isSidebarOpen])

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      setNotificationCount(0)
      return
    }

    let mounted = true
    const loadInbox = async () => {
      try {
        const messages = await fetchInbox()
        const unread = messages.filter((msg) => !msg.read_at).length
        if (mounted) setUnreadCount(unread)
        if (mounted) setInboxPreview(messages.slice(0, 5))
      } catch (error) {
        console.error("Failed to load inbox notifications:", error)
      }
    }

    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${backendUrl}/api/notifications`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (response.ok) {
          const data = await response.json()
          if (mounted) {
            setNotifications(data.slice(0, 5))
            const unreadNotifs = data.filter((n: any) => !n.read).length
            setNotificationCount(unreadNotifs)
          }
        }
      } catch (error) {
        console.error("Failed to load system notifications:", error)
      }
    }

    loadInbox()
    loadNotifications()

    // Load chat unread count
    const loadChatUnread = async () => {
      try {
        const data = await fetchUnreadCount()
        if (mounted) setChatUnreadCount(data.unread_count || 0)
      } catch (error) {
        console.error("Failed to load chat unread count:", error)
      }
    }
    loadChatUnread()

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      loadInbox()
      loadNotifications()
      loadChatUnread()
    }, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [isAuthenticated, backendUrl])

  const mainNavItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      {
        path: "/home",
        label: t("home"),
        description: "Overview of the platform",
        icon: LayoutDashboard,
      },
      {
        path: "/about",
        label: t("about"),
        description: "Learn about the system",
        icon: BookOpen,
      },
      {
        path: "/contact",
        label: t("contact"),
        description: "Reach support and administration",
        icon: Users,
      },
      {
        path: "/survey",
        label: "Survey",
        description: "Feedback and community input",
        icon: Sparkles,
      },
      {
        path: "/community",
        label: "Community",
        description: "School reviews and recommendations",
        icon: Users,
      },
    ]

    if (user?.role === "leader" || user?.role === "admin") {
      items.splice(1, 0, {
        path: "/schools",
        label: t("schools"),
        description: "Manage school records",
        icon: School,
      })
    }

    return items
  }, [t, user?.role])

  const workspaceItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = []

    if (!user || user.role === "student") {
      items.push({
        path: "/student",
        label: t("student"),
        description: "Student workspace and progress",
        icon: BookOpen,
      })
    }

    if (user?.role === "parent") {
      items.push({
        path: "/parent",
        label: "Parent Portal",
        description: "Track children, invoices, and updates",
        icon: Users,
      })
    }

    if (user?.role === "teacher") {
      items.push({
        path: "/teacher",
        label: "Teacher Portal",
        description: "Classes, messages, and reports",
        icon: LayoutDashboard,
      })
    }

    if (user?.role === "leader") {
      items.push(
        {
          path: "/leader",
          label: "Leader Portal",
          description: "Applications, surveys, and oversight",
          icon: LayoutDashboard,
        },
        {
          path: "/teacher",
          label: "Staff Portal",
          description: "Operational tools for staff workflows",
          icon: Users,
        }
      )
    }

    if (user?.role === "admin") {
      items.push(
        {
          path: "/admin",
          label: t("admin"),
          description: "Platform administration and analytics",
          icon: LayoutDashboard,
        },
        {
          path: "/teacher",
          label: "Staff Portal",
          description: "Internal operational workspace",
          icon: Users,
        },
        {
          path: "/leader",
          label: "Applications",
          description: "Review school application workflows",
          icon: School,
        }
      )
    }

    return items
  }, [t, user])

  const quickLinks = useMemo<NavItem[]>(() => {
    if (!isAuthenticated || !user) {
      return [
        {
          path: "/auth/signin",
          label: "Sign In",
          description: "Access personalized tools",
          icon: User,
        },
      ]
    }

    return [
      {
        path: "/profile",
        label: "Profile",
        description: "Update account and preferences",
        icon: Settings,
      },
      {
        path: "/inbox",
        label: "Messenger",
        description: "Direct messages and social network",
        icon: MessageCircle,
      },
    ]
  }, [isAuthenticated, user])

  const currentRole =
    user?.role && user.role in roleConfig ? roleConfig[user.role as keyof typeof roleConfig] : null
  const unreadTotal = unreadCount + notificationCount
  const currentSectionLabel = formatLabelFromPath(pathname)
  const activeTheme = mounted ? resolvedTheme || theme : "light"
  const isDarkMode = activeTheme === "dark"

  const handleMarkRead = async (id: number) => {
    try {
      await markMessageRead(id)
      setInboxPreview((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read_at: new Date().toISOString() } : msg))
      )
      setUnreadCount((prev) => Math.max(prev - 1, 0))
      setShowNotifications(false)
    } catch (error) {
      console.error("Failed to mark message as read:", error)
    }
  }

  const handleMarkNotificationRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${backendUrl}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
        )
        setNotificationCount((prev) => Math.max(prev - 1, 0))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const isActive = (path: string) => pathname === path
  const sidebarVisible = isSidebarOpen

  const SidebarLink = ({
    item,
    onClick,
  }: {
    item: NavItem
    onClick?: () => void
  }) => {
    const Icon = item.icon

    return (
      <Link
        href={item.path}
        onClick={onClick}
        className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${isActive(item.path)
          ? "border-blue-500/30 bg-blue-600/10 text-blue-700 shadow-sm dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-200"
          : "border-transparent bg-white/70 text-slate-700 hover:border-slate-200 hover:bg-white hover:text-slate-950 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
          }`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${isActive(item.path)
            ? "bg-blue-600 text-white dark:bg-blue-500"
            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700"
            }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{item.label}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 dark:text-slate-500" />
      </Link>
    )
  }

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/80 ${sidebarVisible ? "lg:ml-72 lg:w-[calc(100%-18rem)]" : "ml-0 w-full"
          }`}
      >
        <div className="flex min-h-20 items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Toggle navigation sidebar"
            >
              {sidebarVisible ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href={currentRole?.homePath || "/home"} className="flex min-w-0 items-center gap-3 group">
              <img src="/logo.png" alt="RSBS" className="h-10 w-10 object-contain transition-transform group-hover:scale-110" />
              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight text-slate-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  RSBS
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                  <span>{currentSectionLabel}</span>
                  {currentRole ? (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      {currentRole.label}
                    </span>
                  ) : (
                    <span className="rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 px-2 py-0.5 text-purple-600 dark:text-purple-400">
                      Guest
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {isAuthenticated ? "Workspace active" : "Explore RSBS"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "rw" : "en")}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "en" ? "RW" : "EN"}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              aria-label="Toggle color theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated && user ? (
              <>
                <Link
                  href="/inbox"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                  title="Messenger"
                >
                  <MessageCircle className="h-4 w-4" />
                  {chatUnreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-purple-600 px-1.5 text-[10px] font-semibold text-white">
                      {chatUnreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadTotal > 0 && (
                      <span className="absolute right-1.5 top-1.5 rounded-full bg-purple-600 px-1.5 text-[10px] font-semibold text-white">
                        {unreadTotal}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-[22rem] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950">
                      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Notifications
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {unreadTotal} unread update{unreadTotal === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="max-h-[26rem] overflow-y-auto">
                        {notifications.length > 0 && (
                          <div className="border-b border-slate-200 dark:border-slate-800">
                            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              System
                            </div>
                            {notifications.map((notif) => (
                              <button
                                key={notif.id}
                                type="button"
                                onClick={() => handleMarkNotificationRead(notif.id)}
                                className={`w-full border-t border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 ${!notif.read ? "bg-purple-50/80 dark:bg-purple-500/10" : ""
                                  }`}
                              >
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {notif.title}
                                </p>
                                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                  {notif.message}
                                </p>
                                <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                                  {new Date(notif.created_at).toLocaleDateString()}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                        {inboxPreview.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                              Messages
                            </div>
                            {inboxPreview.map((msg) => (
                              <button
                                key={msg.id}
                                type="button"
                                onClick={() => handleMarkRead(msg.id)}
                                className={`w-full border-t border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 ${!msg.read_at ? "bg-purple-50/80 dark:bg-purple-500/10" : ""
                                  }`}
                              >
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {msg.sender_first_name} {msg.sender_last_name}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                  {msg.subject || "No subject"}
                                </p>
                                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                                  {msg.body}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                        {inboxPreview.length === 0 && notifications.length === 0 && (
                          <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            No notifications yet.
                          </div>
                        )}
                      </div>
                      <Link
                        href={
                          user.role === "parent"
                            ? "/parent"
                            : user.role === "teacher" || user.role === "leader" || user.role === "admin"
                              ? "/teacher"
                              : "/student"
                        }
                        className="block border-t border-slate-200 px-4 py-3 text-sm font-medium text-purple-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-purple-300 dark:hover:bg-slate-900"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all messages
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/profile"
                  className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800 sm:flex"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${currentRole?.accent || "from-blue-500 to-cyan-500"} text-sm font-semibold text-white`}>
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentRole?.label || user.role}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/20"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex h-11 items-center rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:scale-105 active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition lg:hidden ${sidebarVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        id="rsbs-sidebar"
        className={`fixed bottom-0 left-0 top-0 z-40 w-72 border-r border-slate-200/70 bg-white/90 px-4 py-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/90 ${sidebarVisible ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col gap-5 overflow-y-auto">
          <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
            <div className="flex items-start gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${currentRole?.accent || "from-blue-500 to-cyan-500"} text-base font-semibold text-white shadow-lg`}>
                {getInitials(user?.first_name, user?.last_name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-slate-950 dark:text-white">
                  {user ? `${user.first_name} ${user.last_name}` : "Welcome"}
                </p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {user ? currentRole?.label || user.role : "School community portal"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    {user ? currentRole?.label || user.role : "Community portal"}
                  </span>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-300">
                    {activeTheme === "dark" ? "Dark mode" : "Light mode"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Navigation
            </p>
            {mainNavItems.map((item) => (
              <SidebarLink key={item.path} item={item} onClick={() => setIsSidebarOpen(false)} />
            ))}
          </div>

          {workspaceItems.length > 0 && (
            <div className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Workspace
              </p>
              {workspaceItems.map((item) => (
                <SidebarLink key={item.path} item={item} onClick={() => setIsSidebarOpen(false)} />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Quick Access
            </p>
            {quickLinks.map((item) => (
              <SidebarLink key={item.path} item={item} onClick={() => setIsSidebarOpen(false)} />
            ))}
          </div>

          <div className="mt-auto rounded-[1.75rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 text-sm text-slate-900 dark:border-emerald-500/20 dark:bg-gradient-to-br dark:from-emerald-500/10 dark:via-slate-950 dark:to-amber-500/10 dark:text-slate-100">
            <p className="font-semibold">Rwanda education network</p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Move quickly between schools, profiles, messages, and role-specific workspaces in one cleaner and more focused experience.
            </p>
          </div>
        </div>
      </aside>

      {showChat && <ChatWindow onClose={() => setShowChat(false)} />}
    </>
  )
}
