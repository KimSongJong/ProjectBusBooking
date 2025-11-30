// filepath: c:\Users\lnnta\Downloads\J2EE-ProjectCuoiKi\ProjectBusBooking\frontend-react\src\services\contactMessage.service.ts

import adminApi from "@/config/adminAxios";

export interface ContactMessage {
  id: number;
  userId?: number;
  subject: string;
  name: string;
  email: string;
  phone: string;
  title?: string;
  message: string;
  status: string; // pending, read, resolved
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class ContactMessageService {
  /**
   * Get all contact messages (ADMIN ONLY)
   */
  async getAllMessages(): Promise<ApiResponse<ContactMessage[]>> {
    const response = await adminApi.get("/admin/contact-messages");
    return response.data;
  }

  /**
   * Get contact message by ID (ADMIN ONLY)
   */
  async getMessageById(id: number): Promise<ApiResponse<ContactMessage>> {
    const response = await adminApi.get(`/admin/contact-messages/${id}`);
    return response.data;
  }

  /**
   * Filter contact messages (ADMIN ONLY)
   */
  async filterMessages(
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<ContactMessage[]>> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await adminApi.get(`/admin/contact-messages/filter?${params.toString()}`);
    return response.data;
  }

  /**
   * Search contact messages by keyword (ADMIN ONLY)
   */
  async searchMessages(keyword: string): Promise<ApiResponse<ContactMessage[]>> {
    const response = await adminApi.get(`/admin/contact-messages/search?keyword=${keyword}`);
    return response.data;
  }

  /**
   * Update message status (ADMIN ONLY)
   */
  async updateStatus(id: number, status: string): Promise<ApiResponse<ContactMessage>> {
    const response = await adminApi.patch(`/admin/contact-messages/${id}/status?status=${status}`);
    return response.data;
  }

  /**
   * Delete contact message (ADMIN ONLY)
   */
  async deleteMessage(id: number): Promise<ApiResponse<void>> {
    const response = await adminApi.delete(`/admin/contact-messages/${id}`);
    return response.data;
  }
}

export default new ContactMessageService();

