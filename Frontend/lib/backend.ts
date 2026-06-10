/** Render production API — must match your live Render service URL */
const RENDER_BACKEND = "https://rwandaschoolbridgesystem.onrender.com"

function resolveBackendUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, "")
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return RENDER_BACKEND
  }

  return "http://localhost:5000"
}

export const BACKEND_URL = resolveBackendUrl()
