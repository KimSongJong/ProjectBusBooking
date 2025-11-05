package com.busbooking.controller;

import com.busbooking.dto.request.RouteRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.RouteResponse;
import com.busbooking.dto.response.ScheduleResponse;
import com.busbooking.service.RouteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
public class RouteController {
    
    private final RouteService routeService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<RouteResponse>>> getAllRoutes() {
        List<RouteResponse> routes = routeService.getAllRoutes();
        return ResponseEntity.ok(new ApiResponse<>(true, "Routes retrieved successfully", routes));
    }
    
    @GetMapping("/schedules")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getSchedules() {
        List<ScheduleResponse> schedules = routeService.getSchedules();
        return ResponseEntity.ok(new ApiResponse<>(true, "Schedules retrieved successfully", schedules));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteResponse>> getRouteById(@PathVariable Integer id) {
        RouteResponse route = routeService.getRouteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Route retrieved successfully", route));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<RouteResponse>>> searchRoutes(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        List<RouteResponse> routes = routeService.searchRoutes(from, to);
        return ResponseEntity.ok(new ApiResponse<>(true, "Routes searched successfully", routes));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<RouteResponse>> createRoute(@Valid @RequestBody RouteRequest request) {
        RouteResponse route = routeService.createRoute(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Route created successfully", route));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteResponse>> updateRoute(
            @PathVariable Integer id, 
            @Valid @RequestBody RouteRequest request) {
        RouteResponse route = routeService.updateRoute(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Route updated successfully", route));
    }
}
