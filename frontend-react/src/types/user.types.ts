// User management types

export interface User {
  id: number
  username: string
  email: string
  role: "customer" | "admin" | "staff"
  fullName: string
  phone: string
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
}

export interface CreateUserRequest {
  username: string
  password: string
  email: string
  role: "customer" | "admin" | "staff"
  fullName: string
  phone: string
}

export interface UpdateUserRequest {
  username: string
  password?: string // Password is optional when updating
  email: string
  role: "customer" | "admin" | "staff"
  fullName: string
  phone: string
}
