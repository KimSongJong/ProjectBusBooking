package com.busbooking.repository;

import com.busbooking.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {
    Optional<Driver> findByLicenseNumber(String licenseNumber);
    List<Driver> findByIsActiveTrue();
}
