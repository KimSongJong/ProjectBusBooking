import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import authService from "@/services/auth.service"
import type { LoginResponse, UserResponse } from "@/types/auth.types"

interface AuthContextType {
  user: LoginResponse | UserResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: LoginResponse) => void
  logout: () => void
  updateUser: (user: LoginResponse | UserResponse) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse | UserResponse | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = authService.getUser()
    const token = authService.getToken()
    
    if (storedUser && token) {
      setUser(storedUser)
      setIsAuthenticated(true)
    }

    setIsLoading(false)
  }, [])

  const login = (userData: LoginResponse) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateUser = (userData: LoginResponse | UserResponse) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
