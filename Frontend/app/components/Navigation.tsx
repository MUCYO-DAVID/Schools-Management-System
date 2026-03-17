"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, X, Globe, LogOut, User, Bell, MessageCircle, Settings } from "lucide-react"
import { useLanguage } from "../providers/LanguageProvider"
import { useAuth } from "../providers/AuthProvider"
import { fetchInbox, markMessageRead } from "../api/portal"
import ChatWindow from "./ChatWindow"
import { fetchUnreadCount } from "../api/realtime-chat"

export default function Navigation() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://rwandaschoolsbridgesystem.onrender.com"
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [inboxPreview, setInboxPreview] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [chatUnreadCount, setChatUnreadCount] = useState(0)

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
    <nav className="bg-blue-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/home" className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 via-yellow-400 to-green-500 rounded"></div>
              <span className="text-white font-bold text-base">RSBS</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(item.path) ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "rw" : "en")}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === "en" ? "RW" : "EN"}</span>
            </button>

            {/* User Info and Logout */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3 ml-2 pl-3 border-l border-blue-700">
                {/* Chat Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowChat(true)}
                    className="relative text-blue-100 hover:text-white"
                    title="Messages"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {chatUnreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5">
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
                    className="relative text-blue-100 hover:text-white"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {(unreadCount + notificationCount) > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5">
                        {unreadCount + notificationCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[500px] overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600">
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
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
                  title="Profile"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden lg:inline">Profile</span>
                </Link>
                <div className="flex items-center space-x-2 text-blue-100 text-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="hidden md:inline lg:hidden">
                    {user.first_name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium text-blue-100 hover:bg-red-600 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-3 py-1.5 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive(item.path) ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-800 hover:text-white"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setLanguage(language === "en" ? "rw" : "en")
                  setIsOpen(false)
                }}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors w-full"
              >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "Kinyarwanda" : "English"}</span>
              </button>
              
              {/* Mobile User Info and Logout */}
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-2 text-blue-100 border-t border-blue-700 mt-2 pt-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="text-xs text-blue-300 ml-auto">
                      ({user.role})
                    </span>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
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
                    className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </span>
                    {(unreadCount + notificationCount) > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {unreadCount + notificationCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-red-600 hover:text-white transition-colors w-full mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-800 hover:text-white transition-colors mt-2"
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
