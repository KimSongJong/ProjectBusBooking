package com.busbooking.controller;

import com.busbooking.dto.request.VehicleRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.VehicleResponse;
import com.busbooking.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Vehicles retrieved", vehicleService.getAllVehicles()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Vehicle retrieved", vehicleService.getVehicleById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> create(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse resp = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Vehicle created", resp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> update(@PathVariable Integer id, @Valid @RequestBody VehicleRequest request) {
        VehicleResponse resp = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Vehicle updated", resp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Vehicle deleted", null));
    }
}
