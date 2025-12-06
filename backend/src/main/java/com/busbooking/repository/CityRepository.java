package com.busbooking.repository;

import com.busbooking.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Integer> {

    /**
     * Find city by exact name match
     */
    Optional<City> findByName(String name);

    /**
     * Find city by normalized name for search
     */
    Optional<City> findByNormalizedName(String normalizedName);

    /**
     * Find all active cities
     */
    List<City> findByIsActiveTrue();

    /**
     * Find cities by region
     */
    List<City> findByRegion(String region);

    /**
     * Find popular cities (for dropdown priority)
     */
    @Query("SELECT c FROM City c WHERE c.isPopular = true AND c.isActive = true ORDER BY c.name")
    List<City> findPopularCities();

    /**
     * Check if city name exists (case insensitive)
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Find cities by region and active status
     */
    List<City> findByRegionAndIsActive(String region, Boolean isActive);
}

