// Promotion Types

export interface Promotion {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableToRoundTrip: boolean;
  createdAt: string;
}

export interface ValidatePromotionRequest {
  code: string;
  totalAmount: number;
  isRoundTrip?: boolean;
}

export interface PromotionValidationResponse {
  valid: boolean;
  message: string;
  discountAmount: number;
  finalPrice: number;
  promotion?: Promotion;
}

export interface CreatePromotionRequest {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  isActive?: boolean;
  applicableToRoundTrip?: boolean;
}

export interface UpdatePromotionRequest {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  isActive?: boolean;
  applicableToRoundTrip?: boolean;
}

