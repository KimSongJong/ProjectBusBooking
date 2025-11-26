package com.busbooking.scheduler;

import com.busbooking.model.Ticket;
import com.busbooking.model.TripSeat;
import com.busbooking.repository.TicketRepository;
import com.busbooking.repository.TripSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ⏰ Scheduled Job: Auto-cancel expired tickets
 *
 * Runs every 1 minute to check for tickets that:
 * - Status = BOOKED
 * - expires_at < NOW()
 *
 * Then:
 * 1. Set ticket.status = CANCELLED
 * 2. Release trip_seat (set status = AVAILABLE)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TicketExpirationScheduler {

    private final TicketRepository ticketRepository;
    private final TripSeatRepository tripSeatRepository;

    /**
     * Chạy mỗi 1 phút (60,000 ms)
     * Có thể thay đổi thành 30s nếu muốn nhanh hơn: fixedDelay = 30000
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 10000) // Start after 10s
    @Transactional
    public void cancelExpiredTickets() {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Find all expired tickets
            List<Ticket> expiredTickets = ticketRepository.findExpiredBookedTickets(now);

            if (expiredTickets.isEmpty()) {
                log.debug("⏰ No expired tickets found at {}", now);
                return;
            }

            log.info("🚨 Found {} expired tickets to cancel", expiredTickets.size());

            int cancelledCount = 0;
            int seatReleasedCount = 0;

            for (Ticket ticket : expiredTickets) {
                try {
                    log.info("  ❌ Cancelling expired ticket #{} (booking: {}, expired at: {})",
                        ticket.getId(),
                        ticket.getBookingGroupId(),
                        ticket.getExpiresAt());

                    // 1. Cancel ticket
                    ticket.setStatus(Ticket.Status.cancelled);
                    ticket.setCancelledAt(now);
                    ticketRepository.save(ticket);
                    cancelledCount++;

                    // 2. Release seat
                    TripSeat tripSeat = ticket.getTripSeat();
                    if (tripSeat != null) {
                        log.info("    🔓 Releasing seat {} (trip: {})",
                            tripSeat.getSeatNumber(),
                            tripSeat.getTrip().getId());

                        tripSeat.setStatus(TripSeat.SeatStatus.available);
                        tripSeat.setTicket(null); // Remove ticket link
                        tripSeatRepository.save(tripSeat);
                        seatReleasedCount++;
                    } else {
                        log.warn("    ⚠️ Ticket #{} has no TripSeat reference!", ticket.getId());
                    }

                } catch (Exception e) {
                    log.error("    ❌ Error cancelling ticket #{}: {}",
                        ticket.getId(), e.getMessage(), e);
                }
            }

            log.info("✅ Cancelled {} tickets and released {} seats", cancelledCount, seatReleasedCount);

        } catch (Exception e) {
            log.error("❌ Error in cancelExpiredTickets scheduler: {}", e.getMessage(), e);
        }
    }

    /**
     * Optional: Clean up old cancelled tickets (run once per day)
     * Remove tickets that were cancelled more than 7 days ago
     */
    @Scheduled(cron = "0 0 3 * * ?") // Run at 3:00 AM daily
    @Transactional
    public void cleanupOldCancelledTickets() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(7);

            log.info("🧹 Cleaning up cancelled tickets older than {}", cutoffDate);

            // You can implement this if needed
            // int deleted = ticketRepository.deleteOldCancelledTickets(cutoffDate);
            // log.info("✅ Deleted {} old cancelled tickets", deleted);

        } catch (Exception e) {
            log.error("❌ Error in cleanupOldCancelledTickets: {}", e.getMessage(), e);
        }
    }
}

