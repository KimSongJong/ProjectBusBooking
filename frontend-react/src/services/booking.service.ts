import api from '@/config/axios'
import type { ApiResponse } from '@/types/auth.types'

export interface BookingRequest {
  userId: number // BẮT BUỘC
  tripId: number
  seatId: number
  promotionId?: number
  price: number
  bookingMethod: 'online' | 'offline'
  status?: 'booked' | 'confirmed' | 'cancelled'
}

export interface BookingResponse {
  id: number
  user: {
    id: number
    fullName: string
    email: string
    phone: string
  }
  trip: any
  seat: any
  promotion?: any
  price: number
  bookingMethod: string
  status: string
  bookedAt: string
  cancelledAt?: string
}

class BookingService {
  // Tạo ticket mới (booking)
  async createBooking(data: BookingRequest): Promise<ApiResponse<BookingResponse>> {
    return await api.post<ApiResponse<BookingResponse>>('/tickets', data)
  }

  // Lấy thông tin ticket
  async getBookingById(id: number): Promise<ApiResponse<BookingResponse>> {
    return await api.get<ApiResponse<BookingResponse>>(`/tickets/${id}`)
  }

  // Lấy tickets của user
  async getBookingsByUser(userId: number): Promise<ApiResponse<BookingResponse[]>> {
    return await api.get<ApiResponse<BookingResponse[]>>(`/tickets/user/${userId}`)
  }

  // Cập nhật trạng thái ticket sau khi thanh toán
  async updateBookingStatus(id: number, status: string): Promise<ApiResponse<BookingResponse>> {
    return await api.patch<ApiResponse<BookingResponse>>(`/tickets/${id}/status?status=${status}`)
  }
}

export default new BookingService()