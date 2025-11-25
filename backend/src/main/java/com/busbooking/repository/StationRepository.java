package com.busbooking.repository;

import com.busbooking.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StationRepository extends JpaRepository<Station, Integer> {

    List<Station> findByIsActiveTrue();

    List<Station> findByCity(String city);

    List<Station> findByCityAndIsActiveTrue(String city);

    List<Station> findByStationType(Station.StationType stationType);

    @Query("SELECT s FROM Station s WHERE " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Station> searchStations(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT s.city FROM Station s WHERE s.isActive = true ORDER BY s.city")
    List<String> findAllActiveCities();
}

