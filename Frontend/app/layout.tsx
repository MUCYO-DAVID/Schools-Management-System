import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./providers/LanguageProvider"
import { AuthProvider } from "./providers/AuthProvider"
import AIChatBotLoader from "./components/AIChatBotLoader"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rwanda School Bridge System (RSBS)",
  description: "Comprehensive school management system for Rwanda - Connecting students, schools, and education",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-950 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <LanguageProvider>
              <Toaster richColors position="top-right" theme="dark" />
              {children}
              <AIChatBotLoader />
            </LanguageProvider>
          </AuthProvider>
          <footer className="border-t border-slate-200 bg-white/80 px-4 py-4 text-center text-sm text-slate-600 backdrop-blur transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
            <p>&copy; {new Date().getFullYear()} Powered by MD</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
