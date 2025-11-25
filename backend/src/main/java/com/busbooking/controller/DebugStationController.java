package com.busbooking.controller;

import com.busbooking.dto.response.ApiResponse;
import com.busbooking.model.Station;
import com.busbooking.repository.StationRepository;
import com.busbooking.service.StationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Debug controller for troubleshooting station issues
 * ⚠️ REMOVE IN PRODUCTION!
 */
@RestController
@RequestMapping("/api/debug/stations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DebugStationController {

    private final StationRepository stationRepository;
    private final StationService stationService;

    /**
     * Test 1: Count stations in database
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> countStations() {
        try {
            log.info("🔍 DEBUG: Counting stations...");

            long totalCount = stationRepository.count();
            List<Station> allStations = stationRepository.findAll();
            long activeCount = allStations.stream().filter(s -> s.getIsActive() != null && s.getIsActive()).count();

            Map<String, Object> result = new HashMap<>();
            result.put("totalStations", totalCount);
            result.put("activeStations", activeCount);
            result.put("inactiveStations", totalCount - activeCount);

            log.info("✅ DEBUG: Found {} total stations ({} active)", totalCount, activeCount);

            return ResponseEntity.ok(new ApiResponse<>(true, "Count successful", result));
        } catch (Exception e) {
            log.error("❌ DEBUG: Error counting stations", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("stackTrace", e.getStackTrace()[0].toString());
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Error: " + e.getMessage(), error));
        }
    }

    /**
     * Test 2: Get raw stations without mapping
     */
    @GetMapping("/raw")
    public ResponseEntity<ApiResponse<List<Station>>> getRawStations() {
        try {
            log.info("🔍 DEBUG: Getting raw stations from database...");

            List<Station> stations = stationRepository.findAll();

            // Log each station to find problematic data
            for (Station s : stations) {
                log.info("📍 Station ID={}, name={}, type={}, active={}",
                    s.getId(), s.getName(), s.getStationType(), s.getIsActive());
            }

            log.info("✅ DEBUG: Successfully retrieved {} raw stations", stations.size());

            return ResponseEntity.ok(new ApiResponse<>(true, "Raw data retrieved", stations));
        } catch (Exception e) {
            log.error("❌ DEBUG: Error getting raw stations", e);
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Error: " + e.getMessage(), null));
        }
    }

    /**
     * Test 3: Test station service
     */
    @GetMapping("/test-service")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testService() {
        try {
            log.info("🔍 DEBUG: Testing StationService...");

            Map<String, Object> result = new HashMap<>();

            try {
                var allStations = stationService.getAllStations();
                result.put("getAllStations", "SUCCESS - " + allStations.size() + " stations");
            } catch (Exception e) {
                result.put("getAllStations", "FAILED: " + e.getMessage());
                log.error("❌ getAllStations failed", e);
            }

            try {
                var activeStations = stationService.getActiveStations();
                result.put("getActiveStations", "SUCCESS - " + activeStations.size() + " stations");
            } catch (Exception e) {
                result.put("getActiveStations", "FAILED: " + e.getMessage());
                log.error("❌ getActiveStations failed", e);
            }

            log.info("✅ DEBUG: Service test completed");

            return ResponseEntity.ok(new ApiResponse<>(true, "Service test completed", result));
        } catch (Exception e) {
            log.error("❌ DEBUG: Error in service test", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Error: " + e.getMessage(), error));
        }
    }

    /**
     * Test 4: Check database connection
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> health = new HashMap<>();

        try {
            // Test database query
            long count = stationRepository.count();
            health.put("database", "CONNECTED");
            health.put("stationCount", count);
            health.put("status", "HEALTHY");

            log.info("✅ DEBUG: Health check passed");

            return ResponseEntity.ok(new ApiResponse<>(true, "Health check passed", health));
        } catch (Exception e) {
            log.error("❌ DEBUG: Health check failed", e);
            health.put("database", "ERROR");
            health.put("error", e.getMessage());
            health.put("status", "UNHEALTHY");

            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Health check failed", health));
        }
    }
}

