import api from "@/config/axios"
import type { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from "@/types/promotion.types"
import type { ApiResponse } from "@/types/auth.types"

class PromotionService {
  async getAllPromotions(): Promise<ApiResponse<Promotion[]>> {
    return await api.get<ApiResponse<Promotion[]>>('/promotions')
  }

  async getPromotionById(id: number): Promise<ApiResponse<Promotion>> {
    return await api.get<ApiResponse<Promotion>>(`/promotions/${id}`)
  }

  async createPromotion(promotionData: CreatePromotionRequest): Promise<ApiResponse<Promotion>> {
    return await api.post<ApiResponse<Promotion>>('/promotions', promotionData)
  }

  async updatePromotion(id: number, promotionData: UpdatePromotionRequest): Promise<ApiResponse<Promotion>> {
    return await api.put<ApiResponse<Promotion>>(`/promotions/${id}`, promotionData)
  }

  async deletePromotion(id: number): Promise<ApiResponse<null>> {
    return await api.delete<ApiResponse<null>>(`/promotions/${id}`)
  }
}

const promotionService = new PromotionService()
export default promotionService
