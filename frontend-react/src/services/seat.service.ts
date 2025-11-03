import api from "@/config/axios";
import type { Seat, CreateSeatRequest, UpdateSeatRequest, VehicleOption } from "@/types/seat.types";
import type { ApiResponse } from "@/types/auth.types";

class SeatService {
  // Get all seats
  async getAllSeats(): Promise<ApiResponse<Seat[]>> {
    return await api.get<ApiResponse<Seat[]>>("/seats");
  }

  // Get seat by ID
  async getSeatById(id: number): Promise<ApiResponse<Seat>> {
    return await api.get<ApiResponse<Seat>>(`/seats/${id}`);
  }

  // Create new seat
  async createSeat(data: CreateSeatRequest): Promise<ApiResponse<Seat>> {
    return await api.post<ApiResponse<Seat>>("/seats", data);
  }

  // Update seat
  async updateSeat(id: number, data: UpdateSeatRequest): Promise<ApiResponse<Seat>> {
    return await api.put<ApiResponse<Seat>>(`/seats/${id}`, data);
  }

  // Delete seat
  async deleteSeat(id: number): Promise<ApiResponse<void>> {
    return await api.delete<ApiResponse<void>>(`/seats/${id}`);
  }

  // Get all vehicles for dropdown
  async getAllVehicles(): Promise<ApiResponse<VehicleOption[]>> {
    return await api.get<ApiResponse<VehicleOption[]>>("/vehicles");
  }
}

export default new SeatService();
