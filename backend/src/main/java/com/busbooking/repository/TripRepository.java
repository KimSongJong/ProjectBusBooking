package com.busbooking.repository;

import com.busbooking.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByRouteId(Integer routeId);
    List<Trip> findByStatus(Trip.Status status);
    List<Trip> findByDepartureTimeBetween(LocalDateTime start, LocalDateTime end);
    
    // Tìm các chuyến xe của tài xế trong khoảng thời gian (kiểm tra xung đột lịch)
    @Query("SELECT t FROM Trip t WHERE t.driver.id = :driverId " +
           "AND t.status != 'cancelled' " +
           "AND ((t.departureTime <= :endTime AND t.arrivalTime >= :startTime))")
    List<Trip> findDriverTripsInTimeRange(
            @Param("driverId") Integer driverId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
    
    // Tìm các chuyến xe của tài xế trong khoảng thời gian, trừ chuyến xe hiện tại (dùng cho update)
    @Query("SELECT t FROM Trip t WHERE t.driver.id = :driverId " +
           "AND t.id != :tripId " +
           "AND t.status != 'cancelled' " +
           "AND ((t.departureTime <= :endTime AND t.arrivalTime >= :startTime))")
    List<Trip> findDriverTripsInTimeRangeExcludingTrip(
            @Param("driverId") Integer driverId,
            @Param("tripId") Integer tripId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}
