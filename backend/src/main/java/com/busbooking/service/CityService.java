package com.busbooking.service;

import com.busbooking.model.City;
import com.busbooking.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CityService {

    private final CityRepository cityRepository;

    /**
     * Get all cities (admin management)
     */
    public List<City> getAllCities() {
        log.info("📍 Fetching all cities");
        return cityRepository.findAll();
    }

    /**
     * Get all active cities (for public dropdown)
     */
    public List<City> getActiveCities() {
        log.info("📍 Fetching active cities");
        return cityRepository.findByIsActiveTrue();
    }

    /**
     * Get popular cities (priority in dropdown)
     */
    public List<City> getPopularCities() {
        log.info("⭐ Fetching popular cities");
        return cityRepository.findPopularCities();
    }

    /**
     * Get city by ID
     */
    public City getCityById(Integer id) {
        log.info("📍 Fetching city by ID: {}", id);
        return cityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thành phố với ID: " + id));
    }

    /**
     * Get city by name
     */
    public City getCityByName(String name) {
        log.info("📍 Fetching city by name: {}", name);
        return cityRepository.findByName(name)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thành phố: " + name));
    }

    /**
     * Create new city
     */
    @Transactional
    public City createCity(City city) {
        log.info("➕ Creating new city: {}", city.getName());

        // Check duplicate
        if (cityRepository.existsByNameIgnoreCase(city.getName())) {
            throw new RuntimeException("Thành phố '" + city.getName() + "' đã tồn tại");
        }

        // Auto-generate normalized name
        city.setNormalizedName(normalizeString(city.getName()));

        City savedCity = cityRepository.save(city);
        log.info("✅ City created: {} (ID: {})", savedCity.getName(), savedCity.getId());
        return savedCity;
    }

    /**
     * Update city
     */
    @Transactional
    public City updateCity(Integer id, City cityData) {
        log.info("✏️ Updating city ID: {}", id);

        City existingCity = getCityById(id);

        // Check duplicate name (exclude current city)
        if (!existingCity.getName().equalsIgnoreCase(cityData.getName())) {
            if (cityRepository.existsByNameIgnoreCase(cityData.getName())) {
                throw new RuntimeException("Thành phố '" + cityData.getName() + "' đã tồn tại");
            }
        }

        existingCity.setName(cityData.getName());
        existingCity.setNormalizedName(normalizeString(cityData.getName()));
        existingCity.setRegion(cityData.getRegion());
        existingCity.setIsPopular(cityData.getIsPopular());
        existingCity.setLatitude(cityData.getLatitude());
        existingCity.setLongitude(cityData.getLongitude());

        City updated = cityRepository.save(existingCity);
        log.info("✅ City updated: {}", updated.getName());
        return updated;
    }

    /**
     * Toggle city active status
     */
    @Transactional
    public City toggleCityActive(Integer id) {
        log.info("🔄 Toggling active status for city ID: {}", id);

        City city = getCityById(id);
        city.setIsActive(!city.getIsActive());

        City updated = cityRepository.save(city);
        log.info("✅ City {} is now {}", updated.getName(), updated.getIsActive() ? "ACTIVE" : "INACTIVE");
        return updated;
    }

    /**
     * Delete city (soft delete by setting isActive = false)
     */
    @Transactional
    public void deleteCity(Integer id) {
        log.info("🗑️ Soft deleting city ID: {}", id);

        City city = getCityById(id);
        city.setIsActive(false);
        cityRepository.save(city);

        log.info("✅ City {} soft deleted", city.getName());
    }

    /**
     * Validate city exists (for Stations)
     */
    public boolean cityExists(String cityName) {
        return cityRepository.findByName(cityName).isPresent();
    }

    /**
     * Normalize Vietnamese string for search
     * Example: "Hồ Chí Minh" → "ho chi minh"
     */
    private String normalizeString(String input) {
        if (input == null) return null;

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("\\p{M}", ""); // Remove diacritics
        normalized = normalized.toLowerCase().trim();

        return normalized;
    }
}

