import api from "@/config/axios";
import type { Trip, CreateTripRequest, UpdateTripRequest, RouteOption, VehicleOption, DriverOption } from "@/types/trip.types";
import type { ScheduleGroup } from "@/types/schedule.types";
import type { ApiResponse } from "@/types/auth.types";

class TripService {
  // Get all trips
  async getAllTrips(): Promise<ApiResponse<Trip[]>> {
    return await api.get<ApiResponse<Trip[]>>("/trips");
  }

  // Get trip by ID
  async getTripById(id: number): Promise<ApiResponse<Trip>> {
    return await api.get<ApiResponse<Trip>>(`/trips/${id}`);
  }

  // Create new trip
  async createTrip(data: CreateTripRequest): Promise<ApiResponse<Trip>> {
    return await api.post<ApiResponse<Trip>>("/trips", data);
  }

  // Update trip
  async updateTrip(id: number, data: UpdateTripRequest): Promise<ApiResponse<Trip>> {
    return await api.put<ApiResponse<Trip>>(`/trips/${id}`, data);
  }

  // Delete trip
  async deleteTrip(id: number): Promise<ApiResponse<void>> {
    return await api.delete<ApiResponse<void>>(`/trips/${id}`);
  }

  // Get all routes for dropdown
  async getAllRoutes(): Promise<ApiResponse<RouteOption[]>> {
    return await api.get<ApiResponse<RouteOption[]>>("/routes");
  }

  // Get all vehicles for dropdown
  async getAllVehicles(): Promise<ApiResponse<VehicleOption[]>> {
    return await api.get<ApiResponse<VehicleOption[]>>("/vehicles");
  }
  
  // Get active vehicles only for dropdown
  async getActiveVehicles(): Promise<ApiResponse<VehicleOption[]>> {
    return await api.get<ApiResponse<VehicleOption[]>>("/vehicles/active");
  }

  // Get all drivers for dropdown
  async getAllDrivers(): Promise<ApiResponse<DriverOption[]>> {
    return await api.get<ApiResponse<DriverOption[]>>("/drivers");
  }

  // Get active drivers only for dropdown
  async getActiveDrivers(): Promise<ApiResponse<DriverOption[]>> {
    return await api.get<ApiResponse<DriverOption[]>>("/drivers/active");
  }

  // Get schedule routes grouped by from location
  async getScheduleRoutes(): Promise<ApiResponse<ScheduleGroup[]>> {
    return await api.get<ApiResponse<ScheduleGroup[]>>("/trips/schedule-routes");
  }
}

export default new TripService();
