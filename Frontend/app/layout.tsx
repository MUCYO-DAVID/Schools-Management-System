import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "./providers/LanguageProvider"
import { AuthProvider } from "./providers/AuthProvider"
import AIChatBotLoader from "./components/AIChatBotLoader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RSBS - Rwanda School Bridge System",
  description: "Modern school management system for Rwanda. Connect students, teachers, and schools with powerful analytics and collaboration tools.",
  generator: 'v0.dev',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  keywords: ['school', 'management', 'Rwanda', 'education', 'dashboard', 'students', 'teachers'],
  authors: [{ name: 'RSBS Team' }],
  openGraph: {
    title: 'RSBS - Rwanda School Bridge System',
    description: 'Modern school management system for Rwanda',
    type: 'website',
  },
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
            <AIChatBotLoader />
          </LanguageProvider>
        </AuthProvider>
        <footer className="bg-gray-800 text-white text-center p-4 mt-8">
          <p>&copy; {new Date().getFullYear()} Powered by MD</p>
        </footer>
      </body>
    </html>
  )
}
