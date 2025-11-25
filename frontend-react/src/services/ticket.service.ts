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
    const response = await api.post<RoundTripBookingResponse>("/tickets/round-trip", data);
    return response.data;
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
