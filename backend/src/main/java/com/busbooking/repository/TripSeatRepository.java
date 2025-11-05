package com.busbooking.repository;

import com.busbooking.model.TripSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripSeatRepository extends JpaRepository<TripSeat, Integer> {
    
    List<TripSeat> findByTripId(Integer tripId);
    
    @Query("SELECT ts FROM TripSeat ts WHERE ts.trip.id = :tripId AND ts.status = 'available'")
    List<TripSeat> findAvailableSeatsByTripId(@Param("tripId") Integer tripId);
    
    @Query("SELECT COUNT(ts) FROM TripSeat ts WHERE ts.trip.id = :tripId AND ts.status = 'available'")
    Long countAvailableSeatsByTripId(@Param("tripId") Integer tripId);
    
    @Query("SELECT ts FROM TripSeat ts WHERE ts.trip.id = :tripId AND ts.seatNumber = :seatNumber")
    TripSeat findByTripIdAndSeatNumber(@Param("tripId") Integer tripId, @Param("seatNumber") String seatNumber);
}
