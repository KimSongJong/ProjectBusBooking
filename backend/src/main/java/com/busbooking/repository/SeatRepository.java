package com.busbooking.repository;

import com.busbooking.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {
    List<Seat> findByVehicleId(Integer vehicleId);
    List<Seat> findByVehicleIdAndIsAvailable(Integer vehicleId, Boolean isAvailable);

    // Find seat by vehicle and seat number (for TripSeat to Seat mapping)
    Seat findByVehicleIdAndSeatNumber(Integer vehicleId, String seatNumber);
}
