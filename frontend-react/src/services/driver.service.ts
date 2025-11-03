import api from "@/config/axios"
import type { Driver, CreateDriverRequest, UpdateDriverRequest } from "@/types/driver.types"
import type { ApiResponse } from "@/types/auth.types"

class DriverService {
  /**
   * Get all drivers
   */
  async getAllDrivers(): Promise<ApiResponse<Driver[]>> {
    return await api.get<ApiResponse<Driver[]>>('/drivers')
  }

  /**
   * Get driver by ID
   */
  async getDriverById(id: number): Promise<ApiResponse<Driver>> {
    return await api.get<ApiResponse<Driver>>(`/drivers/${id}`)
  }

  /**
   * Create new driver
   */
  async createDriver(driverData: CreateDriverRequest): Promise<ApiResponse<Driver>> {
    return await api.post<ApiResponse<Driver>>('/drivers', driverData)
  }

  /**
   * Update driver
   */
  async updateDriver(id: number, driverData: UpdateDriverRequest): Promise<ApiResponse<Driver>> {
    return await api.put<ApiResponse<Driver>>(`/drivers/${id}`, driverData)
  }

  /**
   * Delete driver
   */
  async deleteDriver(id: number): Promise<ApiResponse<null>> {
    return await api.delete<ApiResponse<null>>(`/drivers/${id}`)
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(file: File, folder: string = 'drivers'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    console.log('Uploading image:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder: folder
    })

    // Không set Content-Type header, để browser tự động thêm boundary
    return await api.post<ApiResponse<{ url: string }>>('/upload/image', formData)
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(imageUrl: string): Promise<ApiResponse<null>> {
    return await api.delete<ApiResponse<null>>(`/upload/image?url=${encodeURIComponent(imageUrl)}`)
  }
}

const driverService = new DriverService()
export default driverService
