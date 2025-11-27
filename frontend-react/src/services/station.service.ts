// filepath: src/services/station.service.ts
/**
 * 🚉 STATION SERVICE
 * Service to interact with station endpoints
 *
 * Date: 2025-11-28
 */

import api from "@/config/axios";
import type { ApiResponse } from "@/types/api.types";

export interface Station {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  stationType: string;
  isActive: boolean;
  createdAt?: string;
}

class StationService {
  /**
   * Get all stations
   */
  async getAllStations(activeOnly: boolean = false): Promise<ApiResponse<Station[]>> {
    try {
      const response = await api.get<ApiResponse<Station[]>>("/stations", {
        params: { activeOnly }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all stations:", error);
      throw error;
    }
  }

  /**
   * Get stations by city
   * @param city - City name (e.g., "TP Hồ Chí Minh", "Hà Nội")
   */
  async getStationsByCity(city: string): Promise<ApiResponse<Station[]>> {
    try {
      console.log(`🚉 Fetching stations for city: ${city}`);
      const response = await api.get(`/stations/city/${encodeURIComponent(city)}`);

      // 🔍 Backend returns RAW array, not wrapped in ApiResponse
      const rawData = response.data;

      console.log(`✅ Raw API Response for ${city}:`, rawData);
      console.log(`✅ Is array:`, Array.isArray(rawData));
      console.log(`✅ Station count:`, rawData?.length || 0);

      // ✅ Wrap raw array in ApiResponse format
      if (Array.isArray(rawData)) {
        return {
          success: true,
          message: `Found ${rawData.length} stations in ${city}`,
          data: rawData
        };
      }

      // If already wrapped (some endpoints may return ApiResponse)
      if (rawData.success !== undefined) {
        return rawData;
      }

      // Unexpected format
      console.error(`❌ Unexpected response format for ${city}:`, rawData);
      return {
        success: false,
        message: `Unexpected response format`,
        data: []
      };
    } catch (error: any) {
      console.error(`❌ Error fetching stations for city ${city}:`, error);
      console.error(`❌ Error status:`, error.response?.status);
      console.error(`❌ Error message:`, error.response?.data);

      // Return empty array instead of throwing
      return {
        success: false,
        message: error.response?.data?.message || `Failed to load stations for ${city}`,
        data: []
      };
    }
  }

  /**
   * Get station by ID
   */
  async getStationById(id: number): Promise<ApiResponse<Station>> {
    try {
      const response = await api.get<ApiResponse<Station>>(`/stations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching station ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search stations by keyword
   */
  async searchStations(keyword: string): Promise<ApiResponse<Station[]>> {
    try {
      const response = await api.get<ApiResponse<Station[]>>("/stations/search", {
        params: { keyword }
      });
      return response.data;
    } catch (error) {
      console.error("Error searching stations:", error);
      throw error;
    }
  }

  /**
   * Get all active cities
   */
  async getAllCities(): Promise<ApiResponse<string[]>> {
    try {
      const response = await api.get<ApiResponse<string[]>>("/stations/cities");
      return response.data;
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  }
}

const stationService = new StationService();
export default stationService;

