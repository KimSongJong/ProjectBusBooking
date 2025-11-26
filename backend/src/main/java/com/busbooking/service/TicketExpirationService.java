package com.busbooking.service;

import com.busbooking.model.Ticket;
import com.busbooking.model.TripSeat;
import com.busbooking.repository.TicketRepository;
import com.busbooking.repository.TripSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service để tự động hủy vé hết hạn
 * Chạy mỗi phút để check và hủy các vé đã quá 5 phút mà chưa thanh toán
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketExpirationService {

    private final TicketRepository ticketRepository;
    private final TripSeatRepository tripSeatRepository;

    /**
     * Tự động hủy vé hết hạn
     * Cron: chạy mỗi phút (0 * * * * *)
     * - Tìm tất cả vé có status = 'booked' và expiresAt < now
     * - Chuyển status → 'cancelled'
     * - Unlock tất cả ghế của vé đó
     */
    @Scheduled(cron = "0 * * * * *")  // Every minute at :00 seconds
    @Transactional
    public void cancelExpiredTickets() {
        LocalDateTime now = LocalDateTime.now();

        try {
            // Find all BOOKED tickets with expiresAt < now
            List<Ticket> expiredTickets = ticketRepository.findByStatusAndExpiresAtBefore(
                Ticket.Status.booked,
                now
            );

            if (expiredTickets.isEmpty()) {
                log.debug("✅ No expired tickets found at {}", now);
                return;
            }

            log.warn("⚠️ Found {} expired tickets to cancel", expiredTickets.size());

            for (Ticket ticket : expiredTickets) {
                try {
                    cancelExpiredTicket(ticket, now);
                } catch (Exception e) {
                    log.error("❌ Error cancelling ticket {}: {}", ticket.getId(), e.getMessage(), e);
                    // Continue with next ticket even if one fails
                }
            }

            log.info("✅ Cancelled {} expired tickets at {}", expiredTickets.size(), now);

        } catch (Exception e) {
            log.error("❌ Error in cancelExpiredTickets job: {}", e.getMessage(), e);
        }
    }

    /**
     * Hủy một vé đã hết hạn
     */
    private void cancelExpiredTicket(Ticket ticket, LocalDateTime now) {
        log.info("🔄 Cancelling expired ticket {} (booking_group: {}, expired at: {})",
            ticket.getId(), ticket.getBookingGroupId(), ticket.getExpiresAt());

        // 1. Update ticket status
        ticket.setStatus(Ticket.Status.cancelled);
        ticket.setCancelledAt(now);
        ticket.setExpiresAt(null);  // Clear expiration
        ticketRepository.save(ticket);

        // 2. Unlock all seats booked by this ticket
        List<TripSeat> seats = tripSeatRepository.findByTicketId(ticket.getId());

        if (!seats.isEmpty()) {
            log.info("  🔓 Unlocking {} seats for ticket {}", seats.size(), ticket.getId());

            for (TripSeat seat : seats) {
                seat.setTicket(null);  // Remove ticket link
                seat.setStatus(TripSeat.SeatStatus.available);
            }

            tripSeatRepository.saveAll(seats);

            log.info("  ✅ Unlocked seats: {}",
                seats.stream().map(TripSeat::getSeatNumber).toList());
        }

        log.info("  ✅ Ticket {} cancelled successfully", ticket.getId());
    }

    /**
     * Manual method to cancel a specific ticket (for testing)
     */
    @Transactional
    public void cancelTicket(Integer ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        if (ticket.getStatus() != Ticket.Status.booked) {
            throw new IllegalStateException("Only BOOKED tickets can be cancelled. Current status: " + ticket.getStatus());
        }

        cancelExpiredTicket(ticket, LocalDateTime.now());
    }
}

