package com.busbooking.controller;

import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.StationRequest;
import com.busbooking.dto.StationResponse;
import com.busbooking.service.StationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@RestController
@RequestMapping("/stations")
@RequiredArgsConstructor
@Slf4j
public class StationController {

    private final StationService stationService;

    /**
     * GET /api/stations - Get all stations
     */
    @GetMapping("")
    public ResponseEntity<ApiResponse<List<StationResponse>>> getAllStations(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        try {
            log.info("📍 GET /stations?activeOnly={}", activeOnly);
            log.info("📍 Request received from frontend");

            List<StationResponse> stations = activeOnly
                    ? stationService.getActiveStations()
                    : stationService.getAllStations();

            log.info("✅ Successfully retrieved {} stations", stations.size());

            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Lấy danh sách trạm xe thành công", stations));
        } catch (Exception e) {
            log.error("❌ Error fetching stations", e);
            log.error("❌ Stack trace:", e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Lỗi khi lấy danh sách trạm xe: " + e.getMessage(), null));
        }
    }

    /**
     * GET /stations/{id} - Get station by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StationResponse>> getStationById(@PathVariable Integer id) {
        log.info("📍 GET /stations/{}", id);

        StationResponse station = stationService.getStationById(id);

        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin trạm xe thành công", station));
    }

    /**
     * GET /stations/city/{city} - Get stations by city
     */
    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<List<StationResponse>>> getStationsByCity(@PathVariable String city) {
        log.info("📍 GET /stations/city/{}", city);

        List<StationResponse> stations = stationService.getStationsByCity(city);

        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách trạm xe thành công", stations));
    }

    /**
     * GET /stations/search?keyword=xxx - Search stations
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<StationResponse>>> searchStations(
            @RequestParam String keyword
    ) {
        log.info("🔍 GET /stations/search?keyword={}", keyword);

        List<StationResponse> stations = stationService.searchStations(keyword);

        return ResponseEntity.ok(new ApiResponse<>(true, "Tìm kiếm hoàn tất", stations));
    }

    /**
     * GET /stations/cities - Get all cities
     */
    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<String>>> getAllCities() {
        log.info("🏙️ GET /stations/cities");

        List<String> cities = stationService.getAllActiveCities();

        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách thành phố thành công", cities));
    }

    /**
     * POST /stations - Create new station (ADMIN only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StationResponse>> createStation(
            @Valid @RequestBody StationRequest request
    ) {
        log.info("✅ POST /stations - Creating: {}", request.getName());

        StationResponse station = stationService.createStation(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Tạo trạm xe mới thành công", station));
    }

    /**
     * PUT /api/admin/stations/{id} - Update station (ADMIN only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StationResponse>> updateStation(
            @PathVariable Integer id,
            @Valid @RequestBody StationRequest request
    ) {
        log.info("🔄 PUT /api/admin/stations/{} - Updating", id);

        StationResponse station = stationService.updateStation(id, request);

        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạm xe thành công", station));
    }

    /**
     * DELETE /api/admin/stations/{id} - Soft delete station (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStation(@PathVariable Integer id) {
        log.info("🗑️ DELETE /api/admin/stations/{}", id);

        stationService.deleteStation(id);

        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa trạm xe thành công", null));
    }

    /**
     * DELETE /api/admin/stations/{id}/hard - Hard delete station (ADMIN only)
     */
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hardDeleteStation(@PathVariable Integer id) {
        log.info("⚠️ DELETE /api/admin/stations/{}/hard", id);

        stationService.hardDeleteStation(id);

        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa vĩnh viễn trạm xe thành công", null));
    }
}

