// Auth related types based on backend DTOs

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  type?: string
  userId: number
  username: string
  email: string
  role: string
  fullName: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  role: "customer" | "admin" | "staff"
  fullName: string
  phone: string
}

// For user-facing registration form (role is set to "customer" by default)
export interface UserRegisterRequest {
  username: string
  password: string
  email: string
  fullName: string
  phone: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
  role: string
  fullName: string
  phone: string
  createdAt: string
  updatedAt?: string | null
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}
