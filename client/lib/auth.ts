export interface User {
  email: string
  name: string
  role: string
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("crm_user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem("crm_user")
  document.cookie = "crm_session=; path=/; max-age=0" // Delete cookie
  window.location.href = "/login"
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}
