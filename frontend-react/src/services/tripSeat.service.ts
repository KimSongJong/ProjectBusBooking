import api from "@/config/axios";
import type { TripSeat } from "@/types/tripSeat.types";
import type { ApiResponse } from "@/types/auth.types";

class TripSeatService {
  // Get all seats for a trip
  async getSeatsByTrip(tripId: number): Promise<ApiResponse<TripSeat[]>> {
    return await api.get<ApiResponse<TripSeat[]>>(`/trip-seats/trip/${tripId}`);
  }

  // Get available seats for a trip
  async getAvailableSeats(tripId: number): Promise<ApiResponse<TripSeat[]>> {
    return await api.get<ApiResponse<TripSeat[]>>(`/trip-seats/trip/${tripId}/available`);
  }

  // Count available seats
  async countAvailableSeats(tripId: number): Promise<ApiResponse<number>> {
    return await api.get<ApiResponse<number>>(`/trip-seats/trip/${tripId}/available-count`);
  }

  // Book a seat
  async bookSeat(tripSeatId: number): Promise<ApiResponse<TripSeat>> {
    return await api.patch<ApiResponse<TripSeat>>(`/trip-seats/${tripSeatId}/book`);
  }

  // Cancel seat booking
  async cancelSeat(tripSeatId: number): Promise<ApiResponse<TripSeat>> {
    return await api.patch<ApiResponse<TripSeat>>(`/trip-seats/${tripSeatId}/cancel`);
  }

  // Lock a seat
  async lockSeat(tripSeatId: number): Promise<ApiResponse<TripSeat>> {
    return await api.patch<ApiResponse<TripSeat>>(`/trip-seats/${tripSeatId}/lock`);
  }

  // Create seats for a trip
  async createSeatsForTrip(tripId: number): Promise<ApiResponse<void>> {
    return await api.post<ApiResponse<void>>(`/trip-seats/trip/${tripId}/create`);
  }
}

export default new TripSeatService();
