import api from "@/config/axios";
import type { Ticket, CreateTicketRequest, UpdateTicketRequest } from "@/types/ticket.types";
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
}

export default new TicketService();
