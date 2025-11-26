import api from "@/config/axios";
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  RoundTripBookingRequest,
  RoundTripBookingResponse,
  CancelRoundTripResponse
} from "@/types/ticket.types";
import type { ApiResponse } from "@/types/auth.types";

class TicketService {
  // Get all tickets
  async getAllTickets(): Promise<ApiResponse<Ticket[]>> {
    return await api.get<ApiResponse<Ticket[]>>("/tickets");
  }

  // Get ticket by ID
  async getTicketById(id: number): Promise<ApiResponse<Ticket>> {
    return await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
  }

  // Get tickets by user ID
  async getUserTickets(userId: number): Promise<ApiResponse<Ticket[]>> {
    return await api.get<ApiResponse<Ticket[]>>(`/tickets/user/${userId}`);
  }

  // Create new ticket
  async createTicket(data: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
    return await api.post<ApiResponse<Ticket>>("/tickets", data);
  }

  // Update ticket
  async updateTicket(id: number, data: UpdateTicketRequest): Promise<ApiResponse<Ticket>> {
    return await api.put<ApiResponse<Ticket>>(`/tickets/${id}`, data);
  }

  // Delete ticket
  async deleteTicket(id: number): Promise<ApiResponse<void>> {
    return await api.delete<ApiResponse<void>>(`/tickets/${id}`);
  }

  // Update ticket status (booked -> confirmed, or cancelled)
  async updateTicketStatus(id: number, status: string): Promise<ApiResponse<Ticket>> {
    return await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/status?status=${status}`);
  }

  // ⭐ Round Trip Booking Methods

  // Create round trip or one-way booking
  async createRoundTripBooking(data: RoundTripBookingRequest): Promise<RoundTripBookingResponse> {
    try {
      console.log("📤 [SERVICE] Sending round trip booking request:", data);

      // ⚠️ IMPORTANT: Custom axios wrapper (src/config/axios.ts) returns response DIRECTLY
      // NOT wrapped in { data: ... } like standard axios!
      // api.post() -> returns RoundTripBookingResponse directly (not { data: RoundTripBookingResponse })
      const bookingResponse = await api.post<RoundTripBookingResponse>("/tickets/round-trip", data);

      console.log("📦 [SERVICE] Raw response (already unwrapped):", bookingResponse);
      console.log("📦 [SERVICE] Response type:", typeof bookingResponse);
      console.log("📦 [SERVICE] Response keys:", bookingResponse ? Object.keys(bookingResponse) : 'null');

      // ⚠️ CRITICAL CHECK: Ensure response exists
      if (!bookingResponse) {
        console.error("❌ [SERVICE] CRITICAL: response is null/undefined!");
        throw new Error("Backend returned empty response");
      }

      console.log("✅ [SERVICE] Success:", bookingResponse.success, "(type:", typeof bookingResponse.success, ")");
      console.log("✅ [SERVICE] BookingGroupId:", bookingResponse.bookingGroupId);
      console.log("✅ [SERVICE] Message:", bookingResponse.message);
      console.log("✅ [SERVICE] Total Price:", bookingResponse.totalPrice);
      console.log("✅ [SERVICE] Outbound Tickets Count:", bookingResponse.outboundTickets?.length);
      console.log("✅ [SERVICE] Return Tickets Count:", bookingResponse.returnTickets?.length);

      // Final check before returning
      if (!bookingResponse.bookingGroupId) {
        console.error("⚠️ [SERVICE] WARNING: Response missing bookingGroupId!");
        console.error("⚠️ [SERVICE] Full response:", JSON.stringify(bookingResponse, null, 2));
      }

      console.log("✅ [SERVICE] Returning booking response to component...");
      return bookingResponse;
    } catch (error: any) {
      console.error("❌ [SERVICE] Error in createRoundTripBooking service:", error);
      console.error("❌ [SERVICE] Error response:", error.response?.data);
      console.error("❌ [SERVICE] Error status:", error.response?.status);
      console.error("❌ [SERVICE] Error message:", error.message);
      throw error;
    }
  }

  // Get all tickets by booking group ID
  async getTicketsByBookingGroup(groupId: string): Promise<ApiResponse<Ticket[]>> {
    return await api.get<ApiResponse<Ticket[]>>(`/tickets/booking-group/${groupId}`);
  }

  // Cancel round trip booking
  async cancelRoundTripBooking(
    groupId: string,
    option: 'BOTH' | 'OUTBOUND_ONLY' | 'RETURN_ONLY' = 'BOTH'
  ): Promise<ApiResponse<CancelRoundTripResponse>> {
    return await api.delete<ApiResponse<CancelRoundTripResponse>>(
      `/tickets/round-trip/${groupId}?option=${option}`
    );
  }

  // Check if ticket is part of round trip
  async checkIfRoundTrip(ticketId: number): Promise<ApiResponse<any>> {
    return await api.get<ApiResponse<any>>(`/tickets/${ticketId}/is-round-trip`);
  }
}

export default new TicketService();
