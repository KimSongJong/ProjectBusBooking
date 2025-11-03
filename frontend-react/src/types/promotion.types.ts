export interface Promotion {
  id: number
  code: string
  discountPercentage?: number
  discountAmount?: number
  startDate: string
  endDate: string
  maxUses: number
  usedCount: number
  createdAt: string
}

export interface CreatePromotionRequest {
  code: string
  discountPercentage?: number
  discountAmount?: number
  startDate: string
  endDate: string
  maxUses: number
}

export interface UpdatePromotionRequest {
  code: string
  discountPercentage?: number
  discountAmount?: number
  startDate: string
  endDate: string
  maxUses: number
}
