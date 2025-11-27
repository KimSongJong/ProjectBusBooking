import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import type { LoginResponse, UserResponse } from "@/types/auth.types"

interface AdminAuthContextType {
  adminUser: LoginResponse | UserResponse | null
  isAdminAuthenticated: boolean
  isAdminLoading: boolean
  adminLogin: (user: LoginResponse) => void
  adminLogout: () => void
  updateAdminUser: (user: LoginResponse | UserResponse) => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// ⭐ Admin-specific localStorage keys
const ADMIN_USER_KEY = "admin_user"
const ADMIN_TOKEN_KEY = "admin_token"

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<LoginResponse | UserResponse | null>(null)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isAdminLoading, setIsAdminLoading] = useState(true)

  // Load admin user from localStorage on mount
  useEffect(() => {
    const storedUser = getAdminUser()
    const token = getAdminToken()

    if (storedUser && token) {
      setAdminUser(storedUser)
      setIsAdminAuthenticated(true)
    }

    setIsAdminLoading(false)
  }, [])

  const adminLogin = (userData: LoginResponse) => {
    setAdminUser(userData)
    setIsAdminAuthenticated(true)
    setAdminUser_localStorage(userData)
    if (userData.token) {
      setAdminToken(userData.token)
    }
  }

  const adminLogout = () => {
    setAdminUser(null)
    setIsAdminAuthenticated(false)
    clearAdminAuth()
  }

  const updateAdminUser = (userData: LoginResponse | UserResponse) => {
    setAdminUser(userData)
    setIsAdminAuthenticated(true)
    setAdminUser_localStorage(userData)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminAuthenticated,
        isAdminLoading,
        adminLogin,
        adminLogout,
        updateAdminUser,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider")
  }
  return context
}

// ============================================
// Admin-specific localStorage helper functions
// ============================================

function getAdminUser(): LoginResponse | UserResponse | null {
  try {
    const userStr = localStorage.getItem(ADMIN_USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

function setAdminUser_localStorage(user: LoginResponse | UserResponse): void {
  try {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
  } catch (e) {
    console.error("Failed to store admin user info:", e)
  }
}

function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

function clearAdminAuth(): void {
  localStorage.removeItem(ADMIN_USER_KEY)
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

// Export helper functions for use in services
export const adminAuthStorage = {
  getUser: getAdminUser,
  setUser: setAdminUser_localStorage,
  getToken: getAdminToken,
  setToken: setAdminToken,
  clear: clearAdminAuth,
}

