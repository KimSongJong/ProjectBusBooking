package com.busbooking.repository;

import com.busbooking.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    List<Ticket> findByUserId(Integer userId);
    List<Ticket> findByTripId(Integer tripId);
    List<Ticket> findByStatus(Ticket.Status status);
}
