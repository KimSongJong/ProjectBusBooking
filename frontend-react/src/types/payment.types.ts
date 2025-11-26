// Payment related types
export interface Payment {
  id: number;
  bookingGroupId: string;
  ticketCount: number;
  ticketIds: number[]; // ✅ Add ticket IDs array
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'cash' | 'vnpay' | 'momo' | 'zalopay';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate?: string;
  createdAt: string;
}

export interface PaymentStats {
  totalRevenue: number;
  todayRevenue: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  refundedCount: number;
}

export interface CreatePaymentRequest {
  bookingGroupId: string;
  ticketCount: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}

