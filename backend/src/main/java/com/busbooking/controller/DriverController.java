package com.busbooking.controller;

import com.busbooking.dto.request.DriverRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.DriverResponse;
import com.busbooking.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/drivers")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Drivers retrieved", driverService.getAllDrivers()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getActiveDrivers() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Active drivers retrieved", driverService.getActiveDrivers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver retrieved", driverService.getDriverById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DriverResponse>> create(@Valid @RequestBody DriverRequest request) {
        DriverResponse resp = driverService.createDriver(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Driver created", resp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponse>> update(@PathVariable Integer id, @Valid @RequestBody DriverRequest request) {
        DriverResponse resp = driverService.updateDriver(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật tài xế thành công", resp));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<DriverResponse>> toggleStatus(@PathVariable Integer id) {
        DriverResponse resp = driverService.toggleDriverStatus(id);
        String message = resp.getIsActive() ? "Tài xế đã hoạt động trở lại" : "Tài xế đang nghỉ";
        return ResponseEntity.ok(new ApiResponse<>(true, message, resp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver deleted", null));
    }
}
