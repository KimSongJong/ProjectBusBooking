package com.busbooking.controller;

import com.busbooking.dto.request.TicketRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.TicketResponse;
import com.busbooking.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {
    
    private final TicketService ticketService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(new ApiResponse<>(true, "Tickets retrieved successfully", tickets));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(@PathVariable Integer id) {
        TicketResponse ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ticket retrieved successfully", ticket));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByUser(@PathVariable Integer userId) {
        List<TicketResponse> tickets = ticketService.getTicketsByUser(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User tickets retrieved successfully", tickets));
    }
    
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByTrip(@PathVariable Integer tripId) {
        List<TicketResponse> tickets = ticketService.getTicketsByTrip(tripId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Trip tickets retrieved successfully", tickets));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody TicketRequest request) {
        TicketResponse ticket = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Ticket created successfully", ticket));
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicketStatus(
            @PathVariable Integer id, 
            @RequestParam String status) {
        TicketResponse ticket = ticketService.updateTicketStatus(id, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ticket status updated successfully", ticket));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Integer id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ticket deleted successfully", null));
    }
}
