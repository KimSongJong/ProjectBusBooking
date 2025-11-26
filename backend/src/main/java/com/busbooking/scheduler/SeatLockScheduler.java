package com.busbooking.scheduler;

/**
 * ⚠️ DEPRECATED: This scheduler is no longer used
 *
 * Replaced by: TicketExpirationScheduler
 *
 * Old approach (removed):
 * - Lock seats temporarily with lockedUntil timestamp
 * - Scheduler unlocks expired seats every minute
 *
 * New approach (current):
 * - User clicks "Thanh toán" → creates ticket with status=booked, expires_at=NOW()+5min
 * - Ticket links to trip_seats via ticket_id
 * - TicketExpirationScheduler auto-cancels expired tickets and releases seats
 *
 * This file kept for reference only. Can be deleted in future cleanup.
 */

// @Component // DISABLED
public class SeatLockScheduler {

    // No longer used - see TicketExpirationScheduler instead
}

