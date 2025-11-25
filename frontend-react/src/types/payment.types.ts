// Payment related types
export interface Payment {
  id: number;
  ticketId: number;
  ticket?: {
    id: number;
    user: {
      fullName: string;
      email: string;
    };
    trip: {
      route: {
        fromLocation: string;
        toLocation: string;
      };
      departureTime: string;
    };
    price: number;
  };
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
  ticketId: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}

