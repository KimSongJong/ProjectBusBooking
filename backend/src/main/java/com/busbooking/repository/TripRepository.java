package com.busbooking.repository;

import com.busbooking.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByRouteId(Integer routeId);
    List<Trip> findByStatus(Trip.Status status);
    List<Trip> findByDepartureTimeBetween(LocalDateTime start, LocalDateTime end);
}
