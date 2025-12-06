package com.busbooking.controller;

import com.busbooking.model.City;
import com.busbooking.service.CityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * City Management Controller
 * Manages cities (63 provinces of Vietnam) for the bus booking system
 * GET endpoints are public (for dropdowns), POST/PUT/DELETE require ADMIN role
 * URL Pattern: /api/cities (matches RouteController pattern)
 */
@RestController
@RequestMapping("/cities")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CityController {

    private final CityService cityService;

    // ============================================
    // ADMIN ENDPOINTS (All require ADMIN role)
    // ============================================

    /**
     * ADMIN: Get all cities (for admin management)
     * GET /api/cities?activeOnly=false
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCities(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        log.info("🌍 GET /cities?activeOnly={}", activeOnly);

        try {
            List<City> cities = activeOnly
                    ? cityService.getActiveCities()
                    : cityService.getAllCities();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách thành phố thành công");
            response.put("data", cities);

            log.info("✅ Returned {} cities", cities.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching cities: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách thành phố: " + e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * ADMIN: Get popular cities
     * GET /api/cities/popular
     * MUST be before /{id} to avoid path conflict
     */
    @GetMapping("/popular")
    public ResponseEntity<Map<String, Object>> getPopularCities() {
        log.info("🌟 GET /cities/popular");

        try {
            List<City> cities = cityService.getPopularCities();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy danh sách thành phố phổ biến thành công");
            response.put("data", cities);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching popular cities: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy danh sách thành phố phổ biến: " + e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * ADMIN: Get city by ID
     * GET /api/cities/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCityById(@PathVariable Integer id) {
        log.info("📍 GET /cities/{}", id);

        try {
            City city = cityService.getCityById(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Lấy thông tin thành phố thành công");
            response.put("data", city);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching city {}: {}", id, e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thông tin thành phố: " + e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * ADMIN: Create new city
     * POST /api/cities
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createCity(@RequestBody Map<String, Object> request) {
        log.info("✨ POST /cities - Creating city: {}", request.get("name"));

        try {
            City city = new City();
            city.setName((String) request.get("name"));
            city.setRegion(City.Region.valueOf((String) request.get("region")));
            city.setIsPopular((Boolean) request.getOrDefault("isPopular", false));
            city.setIsActive(true);

            // Handle coordinates
            if (request.containsKey("latitude")) {
                city.setLatitude(((Number) request.get("latitude")).doubleValue());
            }
            if (request.containsKey("longitude")) {
                city.setLongitude(((Number) request.get("longitude")).doubleValue());
            }

            City savedCity = cityService.createCity(city);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo thành phố mới thành công");
            response.put("data", savedCity);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("❌ Error creating city: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo thành phố: " + e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * ADMIN: Update city
     * PUT /api/cities/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateCity(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request
    ) {
        log.info("🔄 PUT /cities/{} - Updating city", id);

        try {
            City city = new City();
            city.setName((String) request.get("name"));
            city.setRegion(City.Region.valueOf((String) request.get("region")));
            city.setIsPopular((Boolean) request.getOrDefault("isPopular", false));

            // Handle coordinates
            if (request.containsKey("latitude")) {
                city.setLatitude(((Number) request.get("latitude")).doubleValue());
            }
            if (request.containsKey("longitude")) {
                city.setLongitude(((Number) request.get("longitude")).doubleValue());
            }

            City updatedCity = cityService.updateCity(id, city);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật thành phố thành công");
            response.put("data", updatedCity);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error updating city {}: {}", id, e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật thành phố: " + e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * ADMIN: Toggle city active status
     * PUT /api/cities/{id}/toggle
     */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleCityStatus(@PathVariable Integer id) {
        log.info("🔄 PUT /cities/{}/toggle - Toggle active status", id);

        try {
            City city = cityService.getCityById(id);
            city.setIsActive(!city.getIsActive());
            City updatedCity = cityService.updateCity(id, city);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Chuyển đổi trạng thái thành phố thành công");
            response.put("data", updatedCity);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error toggling city {} status: {}", id, e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi chuyển đổi trạng thái thành phố: " + e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * ADMIN: Delete city (soft delete - just deactivate)
     * DELETE /api/cities/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCity(@PathVariable Integer id) {
        log.info("🗑️ DELETE /cities/{} - Soft delete city", id);

        try {
            cityService.deleteCity(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa thành phố thành công");
            response.put("data", null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error deleting city {}: {}", id, e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi xóa thành phố: " + e.getMessage());

            return ResponseEntity.status(500).body(response);
        }
    }
}

