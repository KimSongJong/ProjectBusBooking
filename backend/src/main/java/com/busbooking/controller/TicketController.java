package com.busbooking.controller;

import com.busbooking.dto.RoundTripBookingRequest;
import com.busbooking.dto.RoundTripBookingResponse;
import com.busbooking.dto.request.TicketRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.TicketResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@Slf4j
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
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(
            @PathVariable Integer id,
            @RequestBody TicketRequest request) {
        TicketResponse ticket = ticketService.updateTicket(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ticket updated successfully", ticket));
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

    // ============================================
    // ⭐ ROUND TRIP BOOKING ENDPOINTS
    // ============================================

    /**
     * Create round trip or one-way booking
     * POST /api/tickets/round-trip
     */
    @PostMapping("/round-trip")
    public ResponseEntity<RoundTripBookingResponse> createRoundTripBooking(
            @Valid @RequestBody RoundTripBookingRequest request) {
        try {
            log.info("📥 Received round trip booking request: {}", request.getTripType());
            RoundTripBookingResponse response = ticketService.createRoundTripBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("❌ Error creating round trip booking: {}", e.getMessage(), e);
            RoundTripBookingResponse errorResponse = new RoundTripBookingResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Failed to create booking: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all tickets by booking group ID
     * GET /api/tickets/booking-group/{groupId}
     */
    @GetMapping("/booking-group/{groupId}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByBookingGroup(
            @PathVariable String groupId) {
        List<TicketResponse> tickets = ticketService.getTicketsByBookingGroup(groupId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Booking group tickets retrieved successfully", tickets));
    }

    /**
     * Cancel round trip booking with smart cancel options
     * DELETE /api/tickets/round-trip/{bookingGroupId}?option=BOTH|OUTBOUND_ONLY|RETURN_ONLY
     */
    @DeleteMapping("/round-trip/{bookingGroupId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelRoundTripBooking(
            @PathVariable String bookingGroupId,
            @RequestParam(defaultValue = "BOTH") String option) {
        try {
            log.info("🔴 Cancel request for booking group: {} with option: {}", bookingGroupId, option);

            // Parse cancel option
            TicketService.CancelOption cancelOption;
            try {
                cancelOption = TicketService.CancelOption.valueOf(option.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "Invalid cancel option. Use: BOTH, OUTBOUND_ONLY, or RETURN_ONLY", null)
                );
            }

            // Calculate refund before cancelling
            long refundAmount = ticketService.calculateRefundAmount(bookingGroupId, cancelOption);

            // Cancel the booking
            ticketService.cancelRoundTripBooking(bookingGroupId, cancelOption);

            // Prepare response
            Map<String, Object> result = new HashMap<>();
            result.put("bookingGroupId", bookingGroupId);
            result.put("cancelOption", option);
            result.put("refundAmount", refundAmount);
            result.put("message", "Booking cancelled successfully");

            return ResponseEntity.ok(new ApiResponse<>(true, "Booking cancelled successfully", result));

        } catch (ResourceNotFoundException e) {
            log.error("❌ Booking group not found: {}", bookingGroupId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiResponse<>(false, e.getMessage(), null)
            );
        } catch (Exception e) {
            log.error("❌ Error cancelling booking: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ApiResponse<>(false, "Failed to cancel booking: " + e.getMessage(), null)
            );
        }
    }

    /**
     * Check if ticket is part of round trip
     * GET /api/tickets/{ticketId}/is-round-trip
     */
    @GetMapping("/{ticketId}/is-round-trip")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkIfRoundTrip(@PathVariable Integer ticketId) {
        try {
            boolean isRoundTrip = ticketService.isPartOfRoundTrip(ticketId);

            Map<String, Object> result = new HashMap<>();
            result.put("ticketId", ticketId);
            result.put("isPartOfRoundTrip", isRoundTrip);

            if (isRoundTrip) {
                TicketResponse ticket = ticketService.getTicketById(ticketId);
                result.put("bookingGroupId", ticket.getBookingGroupId());
                result.put("message", "This ticket is part of a round trip booking. Use round-trip cancel endpoint.");
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Check completed", result));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiResponse<>(false, e.getMessage(), null)
            );
        }
    }
}
