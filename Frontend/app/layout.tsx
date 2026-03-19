import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./providers/LanguageProvider"
import { AuthProvider } from "./providers/AuthProvider"
import { ThemeProvider } from "@/components/theme-provider"
import AIChatBotLoader from "./components/AIChatBotLoader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rwanda School Bridge System (RSBS)",
  description: "Comprehensive school management system for Rwanda - Connecting students, schools, and education",
  generator: 'v0.dev',
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <LanguageProvider>
              {children}
              <AIChatBotLoader />
            </LanguageProvider>
          </AuthProvider>
          <footer className="bg-neutral-800 text-neutral-50 text-center p-lg mt-2xl dark:bg-neutral-900">
            <p>&copy; {new Date().getFullYear()} Rwanda School Bridge System. All rights reserved.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
