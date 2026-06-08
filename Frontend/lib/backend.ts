const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

export const BACKEND_URL = raw.replace(/\/$/, "")
