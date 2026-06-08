"use client"

import type React from "react"
import Link from "next/link"
import AuthBackground from "@/app/components/AuthBackground"

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  side,
}: {
  title: string
  subtitle?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  side?: React.ReactNode
}) {
  return (
    <AuthBackground>
      <header className="relative z-20 px-6 py-6 sm:px-12">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="RSBS Logo" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-black tracking-tight text-white">RSBS</span>
        </Link>
      </header>

      <main className="relative z-20 flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-2xl backdrop-blur-md">
          <div className="grid md:grid-cols-2">
            <section className="hidden md:block border-r border-white/10 p-10">
              {side ?? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold tracking-widest text-white/70">WELCOME</p>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white">
                    Rwanda School Bridge System
                  </h2>
                  <p className="max-w-md text-sm leading-relaxed text-white/70">
                    Connect students, teachers, and school leaders with modern tools for learning, management, and
                    community impact.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/80">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">Secure sign-in & verification</div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">School directory & profiles</div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">Leader dashboards</div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">Student experience</div>
                  </div>
                </div>
              )}
            </section>

            <section className="p-8 md:p-10">
              <div className="mb-6 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
                {subtitle ? <div className="text-sm text-white/70">{subtitle}</div> : null}
              </div>

              {children}

              {footer ? <div className="mt-8 text-sm text-white/70">{footer}</div> : null}
            </section>
          </div>
        </div>
      </main>
    </AuthBackground>
  )
}

