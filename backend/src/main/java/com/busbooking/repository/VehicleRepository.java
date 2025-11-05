package com.busbooking.repository;

import com.busbooking.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    List<Vehicle> findByVehicleType(Vehicle.VehicleType vehicleType);
    List<Vehicle> findByIsActiveTrue();
}
