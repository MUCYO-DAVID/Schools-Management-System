"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Globe, LogOut, User } from "lucide-react"
import { useLanguage } from "../providers/LanguageProvider"
import { useAuth } from "../providers/AuthProvider"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated, logout } = useAuth()

  // Home is its own dedicated page; schools is a separate page
  const navItems = [
    { path: "/home", label: t("home") },
    { path: "/contact", label: t("contact") },
    { path: "/about", label: t("about") },
  ]

  // Only show Student link for students (not leaders or admins)
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
    </nav>
  )
}
