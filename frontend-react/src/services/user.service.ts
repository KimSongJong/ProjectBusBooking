import api from "@/config/axios"
import ENDPOINTS from "@/config/constants"
import type { User, CreateUserRequest, UpdateUserRequest } from "@/types/user.types"
import type { ApiResponse } from "@/types/auth.types"

class UserService {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return await api.get<ApiResponse<User[]>>(ENDPOINTS.USERS.BASE)
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    return await api.get<ApiResponse<User>>(ENDPOINTS.USERS.BY_ID(id))
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return await api.post<ApiResponse<User>>(ENDPOINTS.USERS.BASE, userData)
  }

  /**
   * Update user
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return await api.put<ApiResponse<User>>(ENDPOINTS.USERS.BY_ID(id), userData)
  }

  /**
   * Toggle user status (lock/unlock)
   */
  async toggleUserStatus(id: number): Promise<ApiResponse<User>> {
    return await api.patch<ApiResponse<User>>(`${ENDPOINTS.USERS.BY_ID(id)}/toggle-status`)
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<ApiResponse<null>> {
    return await api.delete<ApiResponse<null>>(ENDPOINTS.USERS.BY_ID(id))
  }
}

const userService = new UserService()
export default userService
