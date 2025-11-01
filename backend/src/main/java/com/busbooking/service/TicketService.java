package com.busbooking.service;

import com.busbooking.dto.request.TicketRequest;
import com.busbooking.dto.response.TicketResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.TicketMapper;
import com.busbooking.model.Ticket;
import com.busbooking.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {
    
    private final TicketRepository ticketRepository;
    private final TicketMapper ticketMapper;
    
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(ticketMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public TicketResponse getTicketById(Integer id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        return ticketMapper.toResponse(ticket);
    }
    
    public List<TicketResponse> getTicketsByUser(Integer userId) {
        return ticketRepository.findByUserId(userId).stream()
                .map(ticketMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<TicketResponse> getTicketsByTrip(Integer tripId) {
        return ticketRepository.findByTripId(tripId).stream()
                .map(ticketMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public TicketResponse createTicket(TicketRequest request) {
        Ticket ticket = ticketMapper.toEntity(request);
        Ticket savedTicket = ticketRepository.save(ticket);
        return ticketMapper.toResponse(savedTicket);
    }
    
    public TicketResponse updateTicketStatus(Integer id, String status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        ticket.setStatus(Ticket.Status.valueOf(status));
        Ticket updatedTicket = ticketRepository.save(ticket);
        return ticketMapper.toResponse(updatedTicket);
    }
    
    public void deleteTicket(Integer id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        ticketRepository.delete(ticket);
    }
}
