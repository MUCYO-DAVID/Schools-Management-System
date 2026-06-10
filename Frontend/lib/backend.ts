/** Render production API — override with NEXT_PUBLIC_BACKEND_URL in Vercel if your URL differs */
const RENDER_BACKEND = "https://rwandaschoolsbridgesystem.onrender.com"

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
