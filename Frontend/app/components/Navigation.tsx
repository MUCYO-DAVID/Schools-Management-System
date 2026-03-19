"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X, Globe, LogOut, User, Bell, MessageCircle, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "../providers/LanguageProvider"
import { useAuth } from "../providers/AuthProvider"
import { fetchInbox, markMessageRead } from "../api/portal"
import ChatWindow from "./ChatWindow"
import { fetchUnreadCount } from "../api/realtime-chat"

export default function Navigation() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://rwandaschoolsbridgesystem.onrender.com"
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [unreadCount, setUnreadCount] = useState(0)
  const [inboxPreview, setInboxPreview] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [chatUnreadCount, setChatUnreadCount] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Home is its own dedicated page; schools is a separate page
  const navItems = [
    { path: "/home", label: t("home") },
    { path: "/contact", label: t("contact") },
    { path: "/about", label: t("about") },
  ]

  // Only show Student link for students (not leaders/admins/parents/teachers)
  if (!user || user?.role === "student") {
    navItems.push({ path: "/student", label: t("student") })
  }

  // Only show Schools link for leaders and admins
  if (user?.role === "leader" || user?.role === "admin") {
    navItems.splice(1, 0, { path: "/schools", label: t("schools") })
  }

  // Show Leader Dashboard for leaders
  if (user?.role === "leader") {
    navItems.push({ path: "/leader", label: "Applications" })
  }

  if (user?.role === "admin") {
    navItems.push({ path: "/admin", label: t("admin") })
  }

  if (user?.role === "parent") {
    navItems.push({ path: "/parent", label: "Parent" })
  }

  if (user?.role === "teacher") {
    navItems.push({ path: "/teacher", label: "Teacher" })
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-rwanda-blue dark:bg-neutral-900 shadow-md sticky top-0 z-50 border-b border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/home" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-rwanda-blue via-rwanda-yellow to-rwanda-green rounded-lg shadow-sm group-hover:shadow-md transition-shadow"></div>
              <span className="text-white font-bold text-lg hidden sm:inline">RSBS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-lg py-md rounded-md text-body-md font-medium transition-all duration-200 ${isActive(item.path) ? "bg-white bg-opacity-20 text-white" : "text-white hover:bg-white hover:bg-opacity-10"
                  }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center space-x-sm px-lg py-md rounded-md text-body-sm font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "rw" : "en")}
              className="flex items-center space-x-sm px-lg py-md rounded-md text-body-sm font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            >
              <Globe className="w-4 h-4" />
              <span>{language === "en" ? "RW" : "EN"}</span>
            </button>

            {/* User Info and Logout */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-md ml-lg pl-lg border-l border-white border-opacity-20">
                {/* Chat Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowChat(true)}
                    className="relative text-white hover:bg-white hover:bg-opacity-10 p-md rounded-lg transition-all duration-200"
                    title="Messages"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {chatUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {chatUnreadCount}
                      </span>
                    )}
                  </button>
                </div>
                
                {/* Notifications Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative text-white hover:bg-white hover:bg-opacity-10 p-md rounded-lg transition-all duration-200"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {(unreadCount + notificationCount) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount + notificationCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-lg dark:shadow-dark-lg z-50 max-h-[500px] overflow-hidden">
                      <div className="px-lg py-md border-b border-border text-body-sm font-semibold text-muted-foreground">
                        Notifications ({unreadCount + notificationCount} unread)
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 && (
                          <div className="border-b border-gray-200">
                            <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-700">
                              System
                            </div>
                            {notifications.map((notif) => (
                              <button
                                key={notif.id}
                                type="button"
                                onClick={() => handleMarkNotificationRead(notif.id)}
                                className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 ${
                                  !notif.read ? 'bg-blue-50' : ''
                                }`}
                              >
                                <p className="text-sm font-medium text-gray-900">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.created_at).toLocaleDateString()}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                        {inboxPreview.length === 0 && notifications.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-gray-500">No notifications yet.</div>
                        ) : inboxPreview.length > 0 ? (
                          <div>
                            <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold text-gray-700">
                              Messages
                            </div>
                            {inboxPreview.map((msg) => (
                              <button
                                key={msg.id}
                                type="button"
                                onClick={() => handleMarkRead(msg.id)}
                                className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-gray-50 ${
                                  !msg.read_at ? 'bg-blue-50' : ''
                                }`}
                              >
                                <p className="text-xs text-gray-500">
                                  {msg.sender_first_name} {msg.sender_last_name}
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {msg.subject || "No subject"}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">{msg.body}</p>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <Link
                        href={
                          user.role === "parent"
                            ? "/parent"
                            : user.role === "teacher" || user.role === "leader" || user.role === "admin"
                              ? "/teacher"
                              : "/student"
                        }
                        className="block px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all messages
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  href="/profile"
                  className="flex items-center space-x-sm px-lg py-md rounded-lg text-body-sm font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                  title="Profile"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden lg:inline">Profile</span>
                </Link>
                <div className="flex items-center space-x-md text-white text-body-sm">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden lg:inline font-medium">
                    {user.first_name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-sm px-lg py-md rounded-lg text-body-sm font-medium text-white hover:bg-red-500 hover:bg-opacity-90 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-lg py-md rounded-lg text-body-sm font-medium text-white bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
          
          {/* Chat Window Modal */}
          {showChat && (
            <ChatWindow onClose={() => setShowChat(false)} />
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-blue-100 hover:text-white focus:outline-none focus:text-white"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-background dark:bg-neutral-800 border-t border-border">
            <div className="px-md pt-md pb-lg space-y-sm">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-lg py-md rounded-lg text-body-md font-medium transition-all duration-200 ${isActive(item.path) ? "bg-rwanda-blue text-white" : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              {mounted && (
                <button
                  onClick={() => {
                    setTheme(theme === "dark" ? "light" : "dark")
                    setIsOpen(false)
                  }}
                  className="flex items-center space-x-sm px-lg py-md rounded-lg text-body-md font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 w-full"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </button>
              )}

              <button
                onClick={() => {
                  setLanguage(language === "en" ? "rw" : "en")
                  setIsOpen(false)
                }}
                className="flex items-center space-x-sm px-lg py-md rounded-lg text-body-md font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 w-full"
              >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "Kinyarwanda" : "English"}</span>
              </button>
              
              {/* Mobile User Info and Logout */}
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-md px-lg py-md text-foreground border-t border-border mt-md pt-md">
                    <div className="w-8 h-8 bg-rwanda-blue bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-body-md font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-body-sm text-muted-foreground capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-sm px-lg py-md rounded-lg text-body-md font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 w-full"
                  >
                    <Settings className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href={
                      user.role === "parent"
                        ? "/parent"
                        : user.role === "teacher" || user.role === "leader" || user.role === "admin"
                          ? "/teacher"
                          : "/student"
                    }
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-lg py-md rounded-lg text-body-md font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-200 w-full"
                  >
                    <span className="flex items-center gap-sm">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </span>
                    {(unreadCount + notificationCount) > 0 && (
                      <span className="badge-primary text-xs">
                        {unreadCount + notificationCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    className="flex items-center space-x-sm px-lg py-md rounded-lg text-body-md font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-200 w-full mt-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setIsOpen(false)}
                  className="block px-lg py-md rounded-lg text-body-md font-medium text-white bg-rwanda-blue hover:bg-rwanda-blue-dark transition-all duration-200 mt-md text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Chat Window Modal */}
      {showChat && (
        <ChatWindow onClose={() => setShowChat(false)} />
      )}
    </nav>
  )
}
