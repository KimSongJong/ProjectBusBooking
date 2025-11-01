package com.busbooking.repository;

import com.busbooking.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {
    List<Seat> findByVehicleId(Integer vehicleId);
    List<Seat> findByVehicleIdAndStatus(Integer vehicleId, Seat.Status status);
}
