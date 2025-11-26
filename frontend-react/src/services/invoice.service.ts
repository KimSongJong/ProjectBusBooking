import api from "@/config/axios";
import type { ApiResponse } from "@/types/auth.types";

export interface Invoice {
  id: number;
  invoiceNumber: string;
  bookingGroupId: string;
  payment?: {
    id: number;
    bookingGroupId: string;
    ticketCount: number;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
  };
  user?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
  };
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  invoiceData?: string; // JSON string
  issuedAt: string;
  createdAt: string;
}

export interface CreateInvoiceRequest {
  bookingGroupId: string;
  paymentId?: number;
  userId: number;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  invoiceData?: string;
}

class InvoiceService {
  // Get all invoices
  async getAllInvoices(): Promise<ApiResponse<Invoice[]>> {
    return await api.get<ApiResponse<Invoice[]>>("/invoices");
  }

  // Get invoice by ID
  async getInvoiceById(id: number): Promise<ApiResponse<Invoice>> {
    return await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  }

  // Get invoice by number
  async getInvoiceByNumber(invoiceNumber: string): Promise<ApiResponse<Invoice>> {
    return await api.get<ApiResponse<Invoice>>(`/invoices/invoice-number/${invoiceNumber}`);
  }

  // Get invoice by booking group ID
  async getInvoiceByBookingGroupId(bookingGroupId: string): Promise<ApiResponse<Invoice>> {
    return await api.get<ApiResponse<Invoice>>(`/invoices/booking-group/${bookingGroupId}`);
  }

  // Create invoice
  async createInvoice(data: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    return await api.post<ApiResponse<Invoice>>("/invoices", data);
  }

  // Auto-create invoice from booking group and payment
  async autoCreateInvoice(bookingGroupId: string, paymentId: number): Promise<ApiResponse<Invoice>> {
    return await api.post<ApiResponse<Invoice>>("/invoices/auto-create", null, {
      bookingGroupId,
      paymentId
    });
  }
}

export default new InvoiceService();

