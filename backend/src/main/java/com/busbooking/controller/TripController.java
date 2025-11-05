package com.busbooking.controller;

import com.busbooking.dto.request.TripRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.ScheduleGroupResponse;
import com.busbooking.dto.response.TripResponse;
import com.busbooking.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
public class TripController {
    
    private final TripService tripService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<TripResponse>>> getAllTrips() {
        List<TripResponse> trips = tripService.getAllTrips();
        return ResponseEntity.ok(new ApiResponse<>(true, "Trips retrieved successfully", trips));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TripResponse>> getTripById(@PathVariable Integer id) {
        TripResponse trip = tripService.getTripById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Trip retrieved successfully", trip));
    }
    
    @GetMapping("/route/{routeId}")
    public ResponseEntity<ApiResponse<List<TripResponse>>> getTripsByRoute(@PathVariable Integer routeId) {
        List<TripResponse> trips = tripService.getTripsByRoute(routeId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Trips by route retrieved successfully", trips));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<TripResponse>>> getTripsByStatus(@PathVariable String status) {
        List<TripResponse> trips = tripService.getTripsByStatus(status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Trips by status retrieved successfully", trips));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TripResponse>>> getTripsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<TripResponse> trips = tripService.getTripsInDateRange(start, end);
        return ResponseEntity.ok(new ApiResponse<>(true, "Trips in date range retrieved successfully", trips));
    }
    
    @GetMapping("/schedule-routes")
    public ResponseEntity<ApiResponse<List<ScheduleGroupResponse>>> getScheduleRoutes() {
        List<ScheduleGroupResponse> routes = tripService.getScheduleRoutes();
        return ResponseEntity.ok(new ApiResponse<>(true, "Schedule routes retrieved successfully", routes));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<TripResponse>> createTrip(@Valid @RequestBody TripRequest request) {
        TripResponse trip = tripService.createTrip(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Trip created successfully", trip));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TripResponse>> updateTrip(
            @PathVariable Integer id, 
            @Valid @RequestBody TripRequest request) {
        TripResponse trip = tripService.updateTrip(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Trip updated successfully", trip));
    }
}
