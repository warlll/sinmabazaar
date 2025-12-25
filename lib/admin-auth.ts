// Simple admin authentication with password only
const ADMIN_PASSWORD = "sinma2026"

export function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export function getAdminAuth(): { isAdmin: boolean; timestamp: number } | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("admin_auth")
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    // Session valid for 24 hours
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem("admin_auth")
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function setAdminAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "admin_auth",
      JSON.stringify({
        isAdmin: true,
        timestamp: Date.now(),
      }),
    )
  }
}

export function clearAdminAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_auth")
  }
}
