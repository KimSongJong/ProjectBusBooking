import api from "@/config/axios";
import type { Payment, PaymentStats, CreatePaymentRequest } from "@/types/payment.types";
import type { ApiResponse } from "@/types/auth.types";

class PaymentService {
  // Get all payments
  async getAllPayments(): Promise<ApiResponse<Payment[]>> {
    return await api.get<ApiResponse<Payment[]>>("/payments");
  }

  // Get payment by ID
  async getPaymentById(id: number): Promise<ApiResponse<Payment>> {
    return await api.get<ApiResponse<Payment>>(`/payments/${id}`);
  }

  // Get payment by ticket ID
  async getPaymentByTicketId(ticketId: number): Promise<ApiResponse<Payment>> {
    return await api.get<ApiResponse<Payment>>(`/payments/ticket/${ticketId}`);
  }

  // Get payment by transaction ID
  async getPaymentByTransactionId(transactionId: string): Promise<ApiResponse<Payment>> {
    return await api.get<ApiResponse<Payment>>(`/payments/transaction/${transactionId}`);
  }

  // Get payments by status
  async getPaymentsByStatus(status: string): Promise<ApiResponse<Payment[]>> {
    return await api.get<ApiResponse<Payment[]>>(`/payments/status/${status}`);
  }

  // Get payments by method
  async getPaymentsByMethod(method: string): Promise<ApiResponse<Payment[]>> {
    return await api.get<ApiResponse<Payment[]>>(`/payments/method/${method}`);
  }

  // Get payments by date range
  async getPaymentsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Payment[]>> {
    return await api.get<ApiResponse<Payment[]>>("/payments/date-range", {
      startDate,
      endDate
    });
  }

  // Create payment
  async createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return await api.post<ApiResponse<Payment>>("/payments", data);
  }

  // Update payment status
  async updatePaymentStatus(id: number, status: string): Promise<ApiResponse<Payment>> {
    return await api.patch<ApiResponse<Payment>>(`/payments/${id}/status?status=${status}`);
  }

  // Process refund
  async processRefund(id: number): Promise<ApiResponse<Payment>> {
    return await api.post<ApiResponse<Payment>>(`/payments/${id}/refund`);
  }

  // Delete payment
  async deletePayment(id: number): Promise<ApiResponse<void>> {
    return await api.delete<ApiResponse<void>>(`/payments/${id}`);
  }

  // Get payment stats
  async getPaymentStats(): Promise<ApiResponse<PaymentStats>> {
    return await api.get<ApiResponse<PaymentStats>>("/payments/stats");
  }
}

export default new PaymentService();

