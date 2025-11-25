package com.busbooking.repository;

import com.busbooking.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    // Order by booked_at DESC, then by ID DESC (newest first) for consistent sorting
    @Query("SELECT t FROM Ticket t WHERE t.user.id = :userId ORDER BY t.bookedAt DESC, t.id DESC")
    List<Ticket> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT t FROM Ticket t WHERE t.trip.id = :tripId ORDER BY t.bookedAt DESC, t.id DESC")
    List<Ticket> findByTripId(@Param("tripId") Integer tripId);

    List<Ticket> findByStatus(Ticket.Status status);

    // ⭐ NEW: Find tickets by booking group (for round trip)
    @Query("SELECT t FROM Ticket t WHERE t.bookingGroupId = :bookingGroupId ORDER BY t.isReturnTrip ASC, t.bookedAt DESC")
    List<Ticket> findByBookingGroupId(@Param("bookingGroupId") String bookingGroupId);

    // Find ticket that links to a specific ticket (for deleting round trips)
    @Query("SELECT t FROM Ticket t WHERE t.linkedTicket = :linkedTicket")
    java.util.Optional<Ticket> findByLinkedTicket(@Param("linkedTicket") Ticket linkedTicket);
}
