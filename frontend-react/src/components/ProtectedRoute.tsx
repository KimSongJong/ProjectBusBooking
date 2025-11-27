import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "admin" | "staff" | "customer"
}

/**
 * Protected Route component that checks authentication and role
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()

  // Show loading while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Đang tải...</div>
    </div>
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    // If not the required role and not admin, redirect to main page
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

/**
 * Admin Protected Route - requires admin or staff role
 * ⭐ Uses separate AdminAuthContext to avoid conflicts with customer auth
 */
export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated, adminUser, isAdminLoading } = useAdminAuth()

  // Show loading while checking authentication
  if (isAdminLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Đang tải...</div>
    </div>
  }

  // Not authenticated - redirect to admin login
  if (!isAdminAuthenticated || !adminUser) {
    return <Navigate to="/admin/login" replace />
  }

  // Check if user is admin or staff
  if (adminUser.role !== "admin" && adminUser.role !== "staff") {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
