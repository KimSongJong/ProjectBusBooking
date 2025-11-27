import api from "@/config/axios"
import ENDPOINTS from "@/config/constants"
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserResponse,
  ApiResponse,
} from "@/types/auth.types"

class AuthService {
  /**
   * Login user with username and password
   * @param credentials - username and password
   * @returns LoginResponse with token and user info
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    
    // Store token if login successful
    if (response.success && response.data?.token) {
      api.setToken(response.data.token)
      // Store user info
      this.setUser(response.data)
    }
    
    return response
  }

  /**
   * Register new user
   * @param userData - user registration data
   * @returns UserResponse
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<UserResponse>> {
    const response = await api.post<ApiResponse<UserResponse>>(
      ENDPOINTS.AUTH.REGISTER,
      userData
    )
    return response
  }

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await api.post<ApiResponse<null>>(ENDPOINTS.AUTH.LOGOUT)
      return response
    } finally {
      // Always clear local storage even if API call fails
      api.setToken(null)
      this.clearUser()
    }
  }

  /**
   * Get current authenticated user info
   * @returns UserResponse
   */
  async getMe(): Promise<ApiResponse<UserResponse>> {
    const response = await api.get<ApiResponse<UserResponse>>(ENDPOINTS.AUTH.ME)
    
    if (response.success && response.data) {
      this.setUser(response.data)
    }
    
    return response
  }

  /**
   * Check if user is authenticated (has token)
   */
  isAuthenticated(): boolean {
    return !!api.getToken()
  }

  /**
   * Get stored user info from localStorage
   */
  getUser(): LoginResponse | UserResponse | null {
    try {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  }

  /**
   * Store user info in localStorage
   */
  private setUser(user: LoginResponse | UserResponse): void {
    try {
      localStorage.setItem("user", JSON.stringify(user))
    } catch (e) {
      console.error("Failed to store user info:", e)
    }
  }

  /**
   * Clear user info from localStorage
   */
  private clearUser(): void {
    try {
      localStorage.removeItem("user")
    } catch (e) {
      console.error("Failed to clear user info:", e)
    }
  }

  /**
   * Get current user's token
   */
  getToken(): string | null {
    return api.getToken()
  }

  /**
   * Verify OTP code after registration
   * @param email - user's email
   * @param otpCode - 6-digit OTP code
   * @returns ApiResponse indicating success or failure
   */
  async verifyOtp(email: string, otpCode: string): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      ENDPOINTS.AUTH.VERIFY_OTP,
      { email, otp: otpCode }
    )
    return response
  }

  /**
   * Resend OTP code to user's email
   * @param email - user's email
   * @returns ApiResponse indicating success or failure
   */
  async resendOtp(email: string): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      ENDPOINTS.AUTH.RESEND_OTP,
      { email }
    )
    return response
  }
}

// Export singleton instance
const authService = new AuthService()
export default authService
