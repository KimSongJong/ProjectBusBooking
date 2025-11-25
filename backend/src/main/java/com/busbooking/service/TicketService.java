package com.busbooking.service;

import com.busbooking.dto.RoundTripBookingRequest;
import com.busbooking.dto.RoundTripBookingResponse;
import com.busbooking.dto.request.TicketRequest;
import com.busbooking.dto.response.TicketResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.TicketMapper;
import com.busbooking.model.Ticket;
import com.busbooking.model.Trip;
import com.busbooking.model.TripSeat;
import com.busbooking.model.User;
import com.busbooking.repository.TicketRepository;
import com.busbooking.repository.TripRepository;
import com.busbooking.repository.TripSeatRepository;
import com.busbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {
    
    private final TicketRepository ticketRepository;
    private final TicketMapper ticketMapper;
    private final TripSeatRepository tripSeatRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

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
    
    @Transactional
    public TicketResponse updateTicket(Integer id, TicketRequest request) {
        log.info("📝 Updating ticket {}", id);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        // Update ticket fields if provided
        if (request.getPickupPoint() != null) {
            ticket.setPickupPoint(request.getPickupPoint());
        }
        if (request.getDropoffPoint() != null) {
            ticket.setDropoffPoint(request.getDropoffPoint());
        }
        if (request.getCustomerName() != null) {
            ticket.setCustomerName(request.getCustomerName());
        }
        if (request.getCustomerPhone() != null) {
            ticket.setCustomerPhone(request.getCustomerPhone());
        }
        if (request.getCustomerEmail() != null) {
            ticket.setCustomerEmail(request.getCustomerEmail());
        }
        if (request.getNotes() != null) {
            ticket.setNotes(request.getNotes());
        }
        if (request.getStatus() != null) {
            try {
                Ticket.Status newStatus = Ticket.Status.valueOf(request.getStatus().toLowerCase());
                ticket.setStatus(newStatus);
                if (newStatus == Ticket.Status.cancelled) {
                    ticket.setCancelledAt(LocalDateTime.now());
                }
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + request.getStatus());
            }
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        log.info("✅ Ticket {} updated successfully", id);
        return ticketMapper.toResponse(updatedTicket);
    }

    @Transactional
    public TicketResponse updateTicketStatus(Integer id, String status) {
        try {
            log.info("📝 Updating ticket {} to status: {}", id, status);

            // Find ticket
            Ticket ticket = ticketRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

            // Validate status string
            Ticket.Status newStatus;
            try {
                newStatus = Ticket.Status.valueOf(status.toLowerCase());
            } catch (IllegalArgumentException e) {
                log.error("❌ Invalid status: {}. Valid values: booked, confirmed, cancelled", status);
                throw new IllegalArgumentException("Invalid ticket status: " + status +
                    ". Valid values are: booked, confirmed, cancelled");
            }

            Ticket.Status oldStatus = ticket.getStatus();
            log.info("🔄 Updating ticket {} status from {} to {}", id, oldStatus, newStatus);

            // Update ticket status
            ticket.setStatus(newStatus);

            // ⭐ If canceling ticket, release the seat
            if (newStatus == Ticket.Status.cancelled) {
                log.info("❌ Ticket {} cancelled, releasing seat...", id);

                // Set cancelled time
                ticket.setCancelledAt(LocalDateTime.now());

                // Release the seat in TripSeat
                TripSeat tripSeat = ticket.getTripSeat();
                if (tripSeat != null) {
                    log.info("🔓 Releasing TripSeat {} (seat: {})", tripSeat.getId(), tripSeat.getSeatNumber());
                    tripSeat.setStatus(TripSeat.SeatStatus.available);
                    tripSeatRepository.save(tripSeat);
                    log.info("✅ TripSeat {} released successfully", tripSeat.getId());
                } else {
                    log.warn("⚠️ Ticket {} has no TripSeat reference!", id);
                }
            }

            Ticket updatedTicket = ticketRepository.save(ticket);
            log.info("✅ Ticket {} status updated successfully to {}", id, newStatus);

            return ticketMapper.toResponse(updatedTicket);

        } catch (ResourceNotFoundException | IllegalArgumentException e) {
            log.error("❌ Error updating ticket status: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Unexpected error updating ticket {} status: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to update ticket status: " + e.getMessage(), e);
        }
    }
    
    public void deleteTicket(Integer id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        // Handle round trip tickets - delete linked ticket as well
        if (ticket.getLinkedTicket() != null) {
            Ticket linkedTicket = ticket.getLinkedTicket();
            log.info("🔗 Deleting linked ticket: {} (linked to {})", linkedTicket.getId(), id);

            // Break the link first to avoid circular reference issues
            ticket.setLinkedTicket(null);
            linkedTicket.setLinkedTicket(null);
            ticketRepository.save(ticket);
            ticketRepository.save(linkedTicket);

            // Delete both tickets
            ticketRepository.delete(linkedTicket);
        }

        // Also check if this ticket is linked by another ticket
        Ticket linkingTicket = ticketRepository.findByLinkedTicket(ticket).orElse(null);
        if (linkingTicket != null) {
            log.info("🔗 Found ticket {} linking to this one, unlinking...", linkingTicket.getId());
            linkingTicket.setLinkedTicket(null);
            ticketRepository.save(linkingTicket);
        }

        ticketRepository.delete(ticket);
        log.info("✅ Deleted ticket: {}", id);
    }

    // ============================================
    // ⭐ ROUND TRIP BOOKING METHODS
    // ============================================

    /**
     * Tạo booking khứ hồi (round trip) hoặc một chiều (one way)
     */
    @Transactional
    public RoundTripBookingResponse createRoundTripBooking(RoundTripBookingRequest request) {
        try {
            log.info("🎫 Creating {} booking for user {}", request.getTripType(), request.getUserId());

            // Validate user
            User user = userRepository.findById(request.getUserId().intValue())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Generate booking group ID
            String bookingGroupId = "BOOKING_" + UUID.randomUUID().toString();

            // Create outbound tickets (vé đi)
            List<TicketResponse> outboundTickets = createTicketsForTrip(
                    request.getOutboundTripId(),
                    request.getOutboundSeats(),
                    user,
                    bookingGroupId,
                    request.getTripType(),
                    false, // isReturnTrip = false
                    request.getCustomerName(),
                    request.getCustomerPhone(),
                    request.getCustomerEmail(),
                    request.getOutboundPickupLocation(),
                    request.getOutboundDropoffLocation(),
                    request.getNotes()
            );

            List<TicketResponse> returnTickets = null;

            // Create return tickets (vé về) if round trip
            if (request.getTripType() == Ticket.TripType.round_trip) {
                if (request.getReturnTripId() == null || request.getReturnSeats() == null) {
                    throw new IllegalArgumentException("Return trip ID and seats are required for round trip booking");
                }

                returnTickets = createTicketsForTrip(
                        request.getReturnTripId(),
                        request.getReturnSeats(),
                        user,
                        bookingGroupId,
                        request.getTripType(),
                        true, // isReturnTrip = true
                        request.getCustomerName(),
                        request.getCustomerPhone(),
                        request.getCustomerEmail(),
                        request.getReturnPickupLocation(),
                        request.getReturnDropoffLocation(),
                        request.getNotes()
                );

                // Link tickets (vé đi ↔ vé về)
                linkTickets(outboundTickets, returnTickets);
            }

            // Calculate total price
            long totalPrice = calculateTotalPrice(outboundTickets, returnTickets);
            int totalSeats = outboundTickets.size() + (returnTickets != null ? returnTickets.size() : 0);

            log.info("✅ Booking created successfully: {} tickets, total: {}đ", totalSeats, totalPrice);

            if (request.getTripType() == Ticket.TripType.round_trip) {
                return RoundTripBookingResponse.forRoundTrip(
                        bookingGroupId,
                        outboundTickets,
                        returnTickets,
                        totalPrice,
                        totalSeats
                );
            } else {
                return new RoundTripBookingResponse(
                        bookingGroupId,
                        outboundTickets,
                        "ONE_WAY",
                        totalPrice,
                        totalSeats
                );
            }

        } catch (Exception e) {
            log.error("❌ Error creating booking: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create booking: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo tickets cho một trip (dùng cho cả chiều đi và chiều về)
     */
    private List<TicketResponse> createTicketsForTrip(
            Long tripId,
            List<String> seatNumbers,
            User user,
            String bookingGroupId,
            Ticket.TripType tripType,
            boolean isReturnTrip,
            String customerName,
            String customerPhone,
            String customerEmail,
            String pickupLocation,
            String dropoffLocation,
            String notes
    ) {
        // Find trip
        Trip trip = tripRepository.findById(tripId.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));

        List<TicketResponse> tickets = new ArrayList<>();

        for (String seatNumber : seatNumbers) {
            // Find trip seat
            TripSeat tripSeat = tripSeatRepository.findByTripIdAndSeatNumber(tripId.intValue(), seatNumber);

            if (tripSeat == null) {
                throw new ResourceNotFoundException("Seat " + seatNumber + " not found for trip " + tripId);
            }

            // Check if seat is available
            if (tripSeat.getStatus() != TripSeat.SeatStatus.available) {
                throw new IllegalStateException("Seat " + seatNumber + " is not available");
            }

            // Create ticket
            Ticket ticket = new Ticket();
            ticket.setUser(user);
            ticket.setTrip(trip);
            ticket.setTripSeat(tripSeat);
            ticket.setSeat(tripSeat.getSeat());
            ticket.setPrice(trip.getRoute().getBasePrice()); // Get price from route
            ticket.setBookingMethod(Ticket.BookingMethod.online);
            ticket.setStatus(Ticket.Status.booked);
            ticket.setTripType(tripType);
            ticket.setIsReturnTrip(isReturnTrip);
            ticket.setBookingGroupId(bookingGroupId);
            ticket.setCustomerName(customerName);
            ticket.setCustomerPhone(customerPhone);
            ticket.setCustomerEmail(customerEmail);
            ticket.setPickupPoint(pickupLocation);
            ticket.setDropoffPoint(dropoffLocation);
            ticket.setNotes(notes);

            // Save ticket
            Ticket savedTicket = ticketRepository.save(ticket);

            // Update trip seat status to booked
            tripSeat.setStatus(TripSeat.SeatStatus.booked);
            tripSeatRepository.save(tripSeat);

            tickets.add(ticketMapper.toResponse(savedTicket));
        }

        return tickets;
    }

    /**
     * Link vé đi với vé về (set linked_ticket_id)
     */
    private void linkTickets(List<TicketResponse> outboundTickets, List<TicketResponse> returnTickets) {
        // Link first ticket of each direction
        if (!outboundTickets.isEmpty() && !returnTickets.isEmpty()) {
            Integer outboundId = outboundTickets.get(0).getId();
            Integer returnId = returnTickets.get(0).getId();

            Ticket outboundTicket = ticketRepository.findById(outboundId).orElseThrow();
            Ticket returnTicket = ticketRepository.findById(returnId).orElseThrow();

            outboundTicket.setLinkedTicket(returnTicket);
            returnTicket.setLinkedTicket(outboundTicket);

            ticketRepository.save(outboundTicket);
            ticketRepository.save(returnTicket);

            log.info("🔗 Linked outbound ticket {} with return ticket {}", outboundId, returnId);
        }
    }

    /**
     * Tính tổng giá của booking với discount cho round trip
     */
    private long calculateTotalPrice(List<TicketResponse> outboundTickets, List<TicketResponse> returnTickets) {
        long total = outboundTickets.stream()
                .map(TicketResponse::getPrice)
                .map(BigDecimal::longValue)
                .reduce(0L, Long::sum);

        if (returnTickets != null) {
            total += returnTickets.stream()
                    .map(TicketResponse::getPrice)
                    .map(BigDecimal::longValue)
                    .reduce(0L, Long::sum);

            // Apply 10% discount for round trip
            long discountAmount = (long)(total * 0.1);
            total = total - discountAmount;
            log.info("💰 Round trip discount applied: {}đ (10% off)", discountAmount);
        }

        return total;
    }

    /**
     * Lấy tất cả vé theo booking group ID
     */
    public List<TicketResponse> getTicketsByBookingGroup(String bookingGroupId) {
        return ticketRepository.findByBookingGroupId(bookingGroupId).stream()
                .map(ticketMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================
    // ⭐ SMART CANCEL METHODS FOR ROUND TRIP
    // ============================================

    /**
     * Cancel option enum
     */
    public enum CancelOption {
        BOTH,           // Cancel cả 2 chuyến
        OUTBOUND_ONLY,  // Chỉ cancel chuyến đi
        RETURN_ONLY     // Chỉ cancel chuyến về
    }

    /**
     * Smart cancel for round trip bookings
     */
    @Transactional
    public void cancelRoundTripBooking(String bookingGroupId, CancelOption option) {
        log.info("🔴 Cancelling round trip booking: {} with option: {}", bookingGroupId, option);

        // Find all tickets in booking group
        List<Ticket> tickets = ticketRepository.findByBookingGroupId(bookingGroupId);

        if (tickets.isEmpty()) {
            throw new ResourceNotFoundException("No tickets found for booking group: " + bookingGroupId);
        }

        // Filter tickets based on cancel option
        List<Ticket> ticketsToCancel = switch(option) {
            case BOTH -> tickets;
            case OUTBOUND_ONLY -> tickets.stream()
                    .filter(t -> !t.getIsReturnTrip())
                    .collect(Collectors.toList());
            case RETURN_ONLY -> tickets.stream()
                    .filter(Ticket::getIsReturnTrip)
                    .collect(Collectors.toList());
        };

        log.info("📋 Found {} tickets to cancel out of {} total", ticketsToCancel.size(), tickets.size());

        // Cancel each ticket
        for (Ticket ticket : ticketsToCancel) {
            ticket.setStatus(Ticket.Status.cancelled);
            ticket.setCancelledAt(LocalDateTime.now());

            // Release the seat
            TripSeat tripSeat = ticket.getTripSeat();
            if (tripSeat != null) {
                log.info("🔓 Releasing seat {} for trip {}", tripSeat.getSeatNumber(), tripSeat.getTrip().getId());
                tripSeat.setStatus(TripSeat.SeatStatus.available);
                tripSeatRepository.save(tripSeat);
            }

            ticketRepository.save(ticket);
            log.info("✅ Cancelled ticket #{}", ticket.getId());
        }

        log.info("🎉 Successfully cancelled {} tickets", ticketsToCancel.size());
    }

    /**
     * Calculate refund amount based on cancel option and time
     */
    public long calculateRefundAmount(String bookingGroupId, CancelOption option) {
        List<Ticket> tickets = ticketRepository.findByBookingGroupId(bookingGroupId);

        if (tickets.isEmpty()) {
            return 0;
        }

        // Get tickets to refund based on option
        List<Ticket> ticketsToRefund = switch(option) {
            case BOTH -> tickets;
            case OUTBOUND_ONLY -> tickets.stream()
                    .filter(t -> !t.getIsReturnTrip())
                    .collect(Collectors.toList());
            case RETURN_ONLY -> tickets.stream()
                    .filter(Ticket::getIsReturnTrip)
                    .collect(Collectors.toList());
        };

        // Calculate total price
        long totalPrice = ticketsToRefund.stream()
                .map(Ticket::getPrice)
                .map(BigDecimal::longValue)
                .reduce(0L, Long::sum);

        // Apply refund policy
        double refundPercentage = switch(option) {
            case BOTH -> 0.9;  // 90% refund for cancelling both
            case OUTBOUND_ONLY, RETURN_ONLY -> 0.5;  // 50% refund for partial cancel
        };

        long refundAmount = (long)(totalPrice * refundPercentage);
        log.info("💸 Refund calculation: Total={}đ, Percentage={}%, Refund={}đ",
                totalPrice, (refundPercentage * 100), refundAmount);

        return refundAmount;
    }

    /**
     * Check if ticket is part of round trip and warn user
     */
    public boolean isPartOfRoundTrip(Integer ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        if (ticket.getLinkedTicket() != null) {
            log.warn("⚠️ Ticket #{} is part of a round trip booking (group: {}). " +
                    "Consider using cancelRoundTripBooking() instead.",
                    ticketId, ticket.getBookingGroupId());
            return true;
        }

        return false;
    }
}
