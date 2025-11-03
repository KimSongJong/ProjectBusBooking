import api from "@/config/axios"
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from "@/types/vehicle.types"
import type { ApiResponse } from "@/types/auth.types"

class VehicleService {
  async getAllVehicles(): Promise<ApiResponse<Vehicle[]>> {
    return await api.get<ApiResponse<Vehicle[]>>('/vehicles')
  }

  async getVehicleById(id: number): Promise<ApiResponse<Vehicle>> {
    return await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`)
  }

  async createVehicle(vehicleData: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    return await api.post<ApiResponse<Vehicle>>('/vehicles', vehicleData)
  }

  async updateVehicle(id: number, vehicleData: UpdateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    return await api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, vehicleData)
  }

  async deleteVehicle(id: number): Promise<ApiResponse<null>> {
    return await api.delete<ApiResponse<null>>(`/vehicles/${id}`)
  }
}

const vehicleService = new VehicleService()
export default vehicleService
