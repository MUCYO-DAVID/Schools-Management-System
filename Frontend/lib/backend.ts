/**
 * API base URL.
 * - Local dev: http://localhost:5000 (separate Backend process)
 * - Vercel production: same origin (empty string) — /api routes to Express via vercel.json
 * - Override anytime with NEXT_PUBLIC_BACKEND_URL (e.g. external Render API)
 */
function resolveBackendUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim().replace(/\/$/, "")
  if (configured) return configured

  if (typeof window !== "undefined") {
    return ""
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:5000"
}

export const BACKEND_URL = resolveBackendUrl()
