package com.busbooking.service;

import com.busbooking.dto.RoundTripBookingRequest;
import com.busbooking.dto.RoundTripBookingResponse;
import com.busbooking.dto.request.TicketRequest;
import com.busbooking.dto.response.TicketResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.TicketMapper;
import com.busbooking.model.Payment;
import com.busbooking.model.Ticket;
import com.busbooking.model.Trip;
import com.busbooking.model.TripSeat;
import com.busbooking.model.User;
import com.busbooking.repository.PaymentRepository;
import com.busbooking.repository.TicketRepository;
import com.busbooking.repository.TripRepository;
import com.busbooking.repository.TripSeatRepository;
import com.busbooking.repository.UserRepository;
import com.busbooking.util.EmailTemplateBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final EmailService emailService;
    private final PaymentRepository paymentRepository;

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
    
    @Transactional
    public TicketResponse createTicket(TicketRequest request) {
        Ticket ticket = ticketMapper.toEntity(request);

        // ⭐ Generate booking_group_id if not provided (for one-way tickets)
        // ✅ Format: BOOKING-{UUID} (hyphen, not underscore)
        if (ticket.getBookingGroupId() == null || ticket.getBookingGroupId().isEmpty()) {
            String bookingGroupId = "BOOKING-" + UUID.randomUUID();
            ticket.setBookingGroupId(bookingGroupId);
            log.info("🆕 Generated booking_group_id for one-way ticket: {}", bookingGroupId);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("✅ Created ticket {} with booking_group_id: {}", savedTicket.getId(), savedTicket.getBookingGroupId());
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

            // ⭐ SEND EMAIL INVOICE WHEN TICKET STATUS BECOMES CONFIRMED
            if (newStatus == Ticket.Status.confirmed && oldStatus != Ticket.Status.confirmed) {
                log.info("📧 Ticket status changed to CONFIRMED, triggering email...");
                try {
                    sendInvoiceEmailForConfirmedTicket(updatedTicket);
                } catch (Exception emailError) {
                    log.error("❌ Failed to send invoice email for ticket {}", id, emailError);
                    // Don't throw - email failure shouldn't break status update
                }
            }

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

            // ⭐ Generate booking group ID
            // ✅ Format: BOOKING-{UUID} (hyphen, not underscore)
            String bookingGroupId = "BOOKING-" + UUID.randomUUID();

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

            // ❌ REMOVED: Do NOT send confirmation email here!
            // Email should ONLY be sent AFTER payment completed (via VNPay/MoMo callback)
            // See: VNPayController.callback() and MoMoController.callback()

            // ⚠️ OLD CODE (COMMENTED OUT):
            // try {
            //     sendBookingConfirmationEmail(
            //         request.getCustomerEmail(),
            //         outboundTickets,
            //         returnTickets,
            //         request.getTripType()
            //     );
            // } catch (Exception e) {
            //     log.error("❌ Failed to send confirmation email, but booking was successful", e);
            //     // Don't throw exception - email failure shouldn't break booking
            // }

            log.info("📧 Email will be sent after payment completed (not now)");


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
                log.warn("⚠️ Seat {} is not available for trip {}. Current status: {}",
                        seatNumber, tripId, tripSeat.getStatus());
                throw new IllegalStateException(
                        String.format("Ghế %s đã được đặt hoặc không khả dụng. Vui lòng chọn ghế khác.", seatNumber)
                );
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

            // Save ticket (createdAt and expiresAt set by @PrePersist)
            Ticket savedTicket = ticketRepository.save(ticket);

            // ⭐ NEW: Link seat to ticket and update seat status
            tripSeat.setTicket(savedTicket);  // Set ticket_id foreign key
            tripSeat.setStatus(TripSeat.SeatStatus.booked);
            tripSeatRepository.save(tripSeat);

            log.debug("  ✅ Created ticket {} for seat {} (expires: {})",
                savedTicket.getId(), seatNumber, savedTicket.getExpiresAt());

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
    // ⭐ PAYMENT METHODS
    // ============================================

    /**
     * Mark một ticket as CONFIRMED (sau khi payment success)
     */
    @Transactional
    public void markTicketAsConfirmed(Integer ticketId) {
        log.info("💳 Marking ticket {} as CONFIRMED (paid)", ticketId);

        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        if (ticket.getStatus() != Ticket.Status.booked) {
            log.warn("⚠️ Ticket {} is not in BOOKED status (current: {})", ticketId, ticket.getStatus());
            throw new IllegalStateException("Chỉ có thể thanh toán vé đang ở trạng thái BOOKED");
        }

        // Update ticket status
        ticket.setStatus(Ticket.Status.confirmed);
        ticket.setPaidAt(LocalDateTime.now());
        ticket.setExpiresAt(null);  // Clear expiration since it's confirmed

        ticketRepository.save(ticket);

        log.info("✅ Ticket {} marked as CONFIRMED at {}", ticketId, ticket.getPaidAt());
    }

    /**
     * Mark toàn bộ booking group as PAID (cho round trip hoặc multiple tickets)
     */
    @Transactional
    public void markBookingGroupAsPaid(String bookingGroupId) {
        log.info("💳 Marking booking group {} as PAID", bookingGroupId);

        List<Ticket> tickets = ticketRepository.findByBookingGroupId(bookingGroupId);

        if (tickets.isEmpty()) {
            throw new ResourceNotFoundException("No tickets found for booking group: " + bookingGroupId);
        }

        LocalDateTime paidAt = LocalDateTime.now();
        int updatedCount = 0;

        for (Ticket ticket : tickets) {
            if (ticket.getStatus() == Ticket.Status.booked) {
                ticket.setStatus(Ticket.Status.confirmed);
                ticket.setPaidAt(paidAt);
                ticket.setExpiresAt(null);  // Clear expiration
                updatedCount++;
            } else {
                log.warn("⚠️ Ticket {} is not in BOOKED status (current: {}), skipping",
                    ticket.getId(), ticket.getStatus());
            }
        }

        ticketRepository.saveAll(tickets);

        log.info("✅ Marked {} tickets as PAID for booking group {}", updatedCount, bookingGroupId);
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

    // ============================================
    // ⭐ EMAIL NOTIFICATION METHODS
    // ============================================

    /**
     * Send booking confirmation email (ONE-WAY or ROUND-TRIP)
     */
    private void sendBookingConfirmationEmail(
            String customerEmail,
            List<TicketResponse> outboundTickets,
            List<TicketResponse> returnTickets,
            Ticket.TripType tripType
    ) {
        if (customerEmail == null || customerEmail.isEmpty()) {
            log.warn("⚠️ No customer email provided, skipping confirmation email");
            return;
        }

        try {
            log.info("📧 Preparing to send booking confirmation email to: {}", customerEmail);

            // Get actual Ticket entities for email template
            Ticket outboundTicket = ticketRepository.findById(outboundTickets.get(0).getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

            Map<String, Object> emailData;

            if (tripType == Ticket.TripType.round_trip && returnTickets != null && !returnTickets.isEmpty()) {
                // Round trip email
                Ticket returnTicket = ticketRepository.findById(returnTickets.get(0).getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Return ticket not found"));

                // Calculate discount (10% for round trip)
                BigDecimal totalBeforeDiscount = outboundTicket.getPrice().add(returnTicket.getPrice());
                BigDecimal discountAmount = totalBeforeDiscount.multiply(BigDecimal.valueOf(0.1));

                emailData = EmailTemplateBuilder.buildRoundTripTicketData(
                        outboundTicket,
                        returnTicket,
                        discountAmount
                );

                log.info("📧 Sending ROUND-TRIP confirmation email");
            } else {
                // One-way email
                emailData = EmailTemplateBuilder.buildOneWayTicketData(outboundTicket);
                log.info("📧 Sending ONE-WAY confirmation email");
            }

            // Send email
            emailService.sendTicketConfirmationEmail(customerEmail, emailData);
            log.info("✅ Booking confirmation email sent successfully to: {}", customerEmail);

        } catch (Exception e) {
            log.error("❌ Failed to send booking confirmation email to: {}", customerEmail, e);
            // Don't throw - email failure shouldn't break booking flow
        }
    }

    /**
     * ⭐ Send invoice email when admin confirms ticket payment
     * This is triggered when ticket status changes to CONFIRMED
     * (Since MoMo/VNPay sandbox doesn't send callback to localhost)
     */
    private void sendInvoiceEmailForConfirmedTicket(Ticket confirmedTicket) {
        try {
            String customerEmail = confirmedTicket.getCustomerEmail();
            if (customerEmail == null || customerEmail.isEmpty()) {
                log.warn("⚠️ Ticket {} has no customer email, skipping invoice email", confirmedTicket.getId());
                return;
            }

            log.info("📧 [INVOICE] Preparing invoice email for ticket {} → {}", confirmedTicket.getId(), customerEmail);

            // Find all tickets in this booking group
            String bookingGroupId = confirmedTicket.getBookingGroupId();
            List<Ticket> allTickets = ticketRepository.findByBookingGroupId(bookingGroupId);

            log.info("📧 [INVOICE] Found {} tickets for booking group: {}", allTickets.size(), bookingGroupId);

            // Find payment for this booking group
            Payment payment = paymentRepository.findByBookingGroupId(bookingGroupId)
                    .orElse(null);

            if (payment == null) {
                log.warn("⚠️ No payment found for booking group: {}", bookingGroupId);
                // Create mock payment data from ticket
                payment = new Payment();
                payment.setBookingGroupId(bookingGroupId);
                payment.setAmount(allTickets.stream()
                        .map(Ticket::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add));
                payment.setPaymentStatus(Payment.PaymentStatus.completed);
                payment.setPaymentDate(confirmedTicket.getPaidAt() != null ?
                        confirmedTicket.getPaidAt() : LocalDateTime.now());
            }

            // Prepare ticket details for invoice
            List<Map<String, Object>> ticketDetails = allTickets.stream().map(ticket -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("ticketId", ticket.getId());
                detail.put("tripId", ticket.getTrip() != null ? ticket.getTrip().getId() : "N/A");
                detail.put("from", ticket.getTrip() != null && ticket.getTrip().getRoute() != null
                        ? ticket.getTrip().getRoute().getFromLocation() : "N/A");
                detail.put("to", ticket.getTrip() != null && ticket.getTrip().getRoute() != null
                        ? ticket.getTrip().getRoute().getToLocation() : "N/A");
                detail.put("departureTime", ticket.getTrip() != null
                        ? ticket.getTrip().getDepartureTime() : null);
                detail.put("seatNumber", ticket.getTripSeat() != null
                        ? ticket.getTripSeat().getSeatNumber() : "N/A");
                detail.put("pickupPoint", ticket.getPickupPoint());
                detail.put("dropoffPoint", ticket.getDropoffPoint());
                detail.put("price", ticket.getPrice());
                detail.put("tripType", ticket.getTripType());
                detail.put("isReturnTrip", ticket.getIsReturnTrip()); // ✅ ADD: Determine if this is return trip ticket
                return detail;
            }).collect(java.util.stream.Collectors.toList());

            // Prepare invoice data - COMPLETE with all required fields
            Map<String, Object> invoiceData = new HashMap<>();

            // Customer info
            invoiceData.put("customerName", confirmedTicket.getCustomerName() != null ?
                    confirmedTicket.getCustomerName() : "Quý khách");
            invoiceData.put("customerEmail", confirmedTicket.getCustomerEmail());
            invoiceData.put("customerPhone", confirmedTicket.getCustomerPhone() != null ?
                    confirmedTicket.getCustomerPhone() : "N/A");

            // Payment info
            invoiceData.put("bookingGroupId", bookingGroupId);
            invoiceData.put("paymentId", payment.getId() != null ? payment.getId() : 0);
            invoiceData.put("invoiceNumber", bookingGroupId); // Use booking group ID as invoice number

            // ⭐ Use transactionId from Payment (this is the VNPay/MoMo transaction ID)
            invoiceData.put("transactionId", payment.getTransactionId() != null ?
                    payment.getTransactionId() : bookingGroupId);

            // ⭐ Use payment amount as finalAmount
            invoiceData.put("finalAmount", payment.getAmount());
            invoiceData.put("totalAmount", payment.getAmount());

            // ⭐ Read paymentMethod from Payment entity (vnpay or momo)
            String methodDisplay = payment.getPaymentMethod() != null ?
                    payment.getPaymentMethod().name().toUpperCase() : "VNPay";
            if (methodDisplay.equals("VNPAY")) methodDisplay = "VNPay";
            if (methodDisplay.equals("MOMO")) methodDisplay = "MoMo";
            invoiceData.put("paymentMethod", methodDisplay);

            invoiceData.put("paymentDate", payment.getPaymentDate());
            invoiceData.put("paymentStatus", "Đã thanh toán");
            invoiceData.put("issuedAt", LocalDateTime.now()); // Invoice issue time

            // Ticket info
            invoiceData.put("ticketCount", allTickets.size());
            invoiceData.put("tickets", ticketDetails);

            // Check if this is round trip
            boolean isRoundTrip = allTickets.stream()
                    .anyMatch(t -> t.getTripType() == Ticket.TripType.round_trip);
            invoiceData.put("isRoundTrip", isRoundTrip);

            // ⭐ ONE-WAY ticket specific fields
            if (!isRoundTrip && !allTickets.isEmpty()) {
                Ticket ticket = allTickets.get(0);
                invoiceData.put("tripType", "one_way");
                invoiceData.put("fromCity", ticket.getTrip() != null && ticket.getTrip().getRoute() != null ?
                        ticket.getTrip().getRoute().getFromLocation() : "N/A");
                invoiceData.put("toCity", ticket.getTrip() != null && ticket.getTrip().getRoute() != null ?
                        ticket.getTrip().getRoute().getToLocation() : "N/A");
                invoiceData.put("departureTime", ticket.getTrip() != null ?
                        ticket.getTrip().getDepartureTime() : LocalDateTime.now());
                invoiceData.put("vehiclePlate", ticket.getTrip() != null && ticket.getTrip().getVehicle() != null ?
                        ticket.getTrip().getVehicle().getLicensePlate() : "N/A");
                invoiceData.put("vehicleType", ticket.getTrip() != null && ticket.getTrip().getVehicle() != null ?
                        ticket.getTrip().getVehicle().getVehicleTypeDisplay() : "N/A");
                invoiceData.put("seats", java.util.Arrays.asList(ticket.getTripSeat() != null ?
                        ticket.getTripSeat().getSeatNumber() : "N/A"));

                // ⭐ Add price field for one-way ticket
                invoiceData.put("price", ticket.getPrice());
                invoiceData.put("ticketPrice", ticket.getPrice());

                // ⭐ ADD pickup/dropoff points
                invoiceData.put("pickupPoint", ticket.getPickupPoint() != null ?
                        ticket.getPickupPoint() : "N/A");
                invoiceData.put("dropoffPoint", ticket.getDropoffPoint() != null ?
                        ticket.getDropoffPoint() : "N/A");
            }

            // ⭐ ROUND-TRIP ticket specific fields
            if (isRoundTrip && allTickets.size() >= 2) {
                invoiceData.put("tripType", "round_trip");

                // Find outbound and return tickets
                Ticket outbound = allTickets.stream()
                        .filter(t -> !t.getIsReturnTrip())
                        .findFirst()
                        .orElse(allTickets.get(0));
                Ticket returnTicket = allTickets.stream()
                        .filter(Ticket::getIsReturnTrip)
                        .findFirst()
                        .orElse(allTickets.size() > 1 ? allTickets.get(1) : allTickets.get(0));

                // Outbound trip details
                invoiceData.put("outboundFromCity", outbound.getTrip() != null && outbound.getTrip().getRoute() != null ?
                        outbound.getTrip().getRoute().getFromLocation() : "N/A");
                invoiceData.put("outboundToCity", outbound.getTrip() != null && outbound.getTrip().getRoute() != null ?
                        outbound.getTrip().getRoute().getToLocation() : "N/A");
                invoiceData.put("outboundDepartureTime", outbound.getTrip() != null ?
                        outbound.getTrip().getDepartureTime() : LocalDateTime.now());
                invoiceData.put("outboundVehiclePlate", outbound.getTrip() != null && outbound.getTrip().getVehicle() != null ?
                        outbound.getTrip().getVehicle().getLicensePlate() : "N/A");
                invoiceData.put("outboundSeats", java.util.Arrays.asList(outbound.getTripSeat() != null ?
                        outbound.getTripSeat().getSeatNumber() : "N/A"));
                invoiceData.put("outboundPrice", outbound.getPrice());
                // ⭐ ADD outbound pickup/dropoff points
                invoiceData.put("outboundPickupPoint", outbound.getPickupPoint() != null ?
                        outbound.getPickupPoint() : "Bến xe " + (outbound.getTrip() != null && outbound.getTrip().getRoute() != null ?
                        outbound.getTrip().getRoute().getFromLocation() : "N/A"));
                invoiceData.put("outboundDropoffPoint", outbound.getDropoffPoint() != null ?
                        outbound.getDropoffPoint() : "Bến xe " + (outbound.getTrip() != null && outbound.getTrip().getRoute() != null ?
                        outbound.getTrip().getRoute().getToLocation() : "N/A"));

                // Return trip details
                invoiceData.put("returnFromCity", returnTicket.getTrip() != null && returnTicket.getTrip().getRoute() != null ?
                        returnTicket.getTrip().getRoute().getFromLocation() : "N/A");
                invoiceData.put("returnToCity", returnTicket.getTrip() != null && returnTicket.getTrip().getRoute() != null ?
                        returnTicket.getTrip().getRoute().getToLocation() : "N/A");
                invoiceData.put("returnDepartureTime", returnTicket.getTrip() != null ?
                        returnTicket.getTrip().getDepartureTime() : LocalDateTime.now());
                invoiceData.put("returnVehiclePlate", returnTicket.getTrip() != null && returnTicket.getTrip().getVehicle() != null ?
                        returnTicket.getTrip().getVehicle().getLicensePlate() : "N/A");
                invoiceData.put("returnSeats", java.util.Arrays.asList(returnTicket.getTripSeat() != null ?
                        returnTicket.getTripSeat().getSeatNumber() : "N/A"));
                invoiceData.put("returnPrice", returnTicket.getPrice());
                // ⭐ ADD return pickup/dropoff points
                invoiceData.put("returnPickupPoint", returnTicket.getPickupPoint() != null ?
                        returnTicket.getPickupPoint() : "Bến xe " + (returnTicket.getTrip() != null && returnTicket.getTrip().getRoute() != null ?
                        returnTicket.getTrip().getRoute().getFromLocation() : "N/A"));
                invoiceData.put("returnDropoffPoint", returnTicket.getDropoffPoint() != null ?
                        returnTicket.getDropoffPoint() : "Bến xe " + (returnTicket.getTrip() != null && returnTicket.getTrip().getRoute() != null ?
                        returnTicket.getTrip().getRoute().getToLocation() : "N/A"));

                // Round trip discount (10%)
                BigDecimal totalBeforeDiscount = outbound.getPrice().add(returnTicket.getPrice());
                BigDecimal discountAmount = totalBeforeDiscount.multiply(BigDecimal.valueOf(0.1));
                invoiceData.put("discountAmount", discountAmount);

                // ⭐ ADD: Original prices (before 10% round-trip discount)
                // Current prices are already after 10% discount, so calculate original
                BigDecimal outboundOriginalPrice = outbound.getPrice().divide(BigDecimal.valueOf(0.9), 0, java.math.RoundingMode.HALF_UP);
                BigDecimal returnOriginalPrice = returnTicket.getPrice().divide(BigDecimal.valueOf(0.9), 0, java.math.RoundingMode.HALF_UP);
                invoiceData.put("outboundOriginalPrice", outboundOriginalPrice);
                invoiceData.put("returnOriginalPrice", returnOriginalPrice);
            }

            // ⭐ ADD: Promotion info if applied
            if (payment.getPromotion() != null) {
                invoiceData.put("promotionCode", payment.getPromotion().getCode());

                // Calculate subtotal before promotion (after any round-trip/online discounts)
                BigDecimal subtotalBeforePromotion = allTickets.stream()
                        .map(Ticket::getPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                invoiceData.put("subtotalBeforePromotion", subtotalBeforePromotion);

                // Promotion discount = subtotalBeforePromotion - finalAmount
                BigDecimal promotionDiscount = subtotalBeforePromotion.subtract(payment.getAmount());
                if (promotionDiscount.compareTo(BigDecimal.ZERO) > 0) {
                    invoiceData.put("discountAmount", promotionDiscount);  // Template uses "discountAmount"
                    invoiceData.put("promotionDiscount", promotionDiscount);  // Keep for backward compatibility
                }
            }

            // Send invoice email
            emailService.sendPaymentInvoiceEmail(customerEmail, invoiceData);
            log.info("✅ [INVOICE] Invoice email sent successfully to: {}", customerEmail);
            log.info("📧 [INVOICE] Booking: {} | Tickets: {} | Amount: {} | Email: {}",
                    bookingGroupId, allTickets.size(), payment.getAmount(), customerEmail);

        } catch (Exception e) {
            log.error("❌ [INVOICE] Failed to send invoice email for ticket: {}",
                    confirmedTicket.getId(), e);
            // Don't throw - email failure shouldn't break ticket update
        }
    }
}
