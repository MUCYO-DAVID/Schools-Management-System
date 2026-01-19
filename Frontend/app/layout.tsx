import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./providers/LanguageProvider"
import { AuthProvider } from "./providers/AuthProvider"
import AIChatBot from "./components/AIChatBot"

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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <AIChatBot />
          </LanguageProvider>
        </AuthProvider>
        <footer className="bg-gray-800 text-white text-center p-4 mt-8">
          <p>&copy; {new Date().getFullYear()} Powered by MD</p>
        </footer>
      </body>
    </html>
  )
}
