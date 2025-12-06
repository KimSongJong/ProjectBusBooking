import api from "@/config/axios";
import type {
  Promotion,
  ValidatePromotionRequest,
  PromotionValidationResponse,
  CreatePromotionRequest,
  UpdatePromotionRequest
} from "@/types/promotion.types";
import type { ApiResponse } from "@/types/common.types";

const promotionService = {
  // Get all active promotions
  getActivePromotions: async (): Promise<ApiResponse<Promotion[]>> => {
    const response = await api.get<ApiResponse<Promotion[]>>("/promotions/active");
    return response.data;
  },

  // Validate promotion code
  validatePromotion: async (
    request: ValidatePromotionRequest
  ): Promise<ApiResponse<PromotionValidationResponse>> => {
    const response = await api.post<ApiResponse<PromotionValidationResponse>>(
      "/promotions/validate",
      request
    );
    return response.data;
  },

  // Get all promotions (admin)
  getAllPromotions: async (): Promise<ApiResponse<Promotion[]>> => {
    const response = await api.get<ApiResponse<Promotion[]>>("/promotions");
    return response;
  },

  // Get promotion by ID
  getPromotionById: async (id: number): Promise<ApiResponse<Promotion>> => {
    const response = await api.get<ApiResponse<Promotion>>(`/promotions/${id}`);
    return response.data;
  },

  // Create promotion (admin)
  createPromotion: async (
    request: CreatePromotionRequest
  ): Promise<ApiResponse<Promotion>> => {
    const response = await api.post<ApiResponse<Promotion>>("/promotions", request);
    return response.data;
  },

  // Update promotion (admin)
  updatePromotion: async (
    id: number,
    request: UpdatePromotionRequest
  ): Promise<ApiResponse<Promotion>> => {
    const response = await api.put<ApiResponse<Promotion>>(`/promotions/${id}`, request);
    return response.data;
  },

  // Delete promotion (admin)
  deletePromotion: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/promotions/${id}`);
    return response.data;
  },
};

export default promotionService;

