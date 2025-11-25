package com.busbooking.mapper;

import com.busbooking.dto.request.RouteRequest;
import com.busbooking.dto.response.RouteResponse;
import com.busbooking.model.Route;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class RouteMapper {
    
    private final ObjectMapper objectMapper;

    public RouteMapper(ObjectMapper objectMapper) {
        // Use injected ObjectMapper if available, otherwise create new one
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    public Route toEntity(RouteRequest request) {
        Route route = new Route();
        route.setFromLocation(request.getFromLocation());
        route.setToLocation(request.getToLocation());
        route.setDistanceKm(request.getDistanceKm());
        route.setBasePrice(request.getBasePrice());
        route.setEstimatedDuration(request.getEstimatedDuration());
        return route;
    }
    
    public RouteResponse toResponse(Route route) {
        RouteResponse response = new RouteResponse();
        response.setId(route.getId());
        response.setFromLocation(route.getFromLocation());
        response.setToLocation(route.getToLocation());
        response.setDistanceKm(route.getDistanceKm());
        response.setBasePrice(route.getBasePrice());
        response.setEstimatedDuration(route.getEstimatedDuration());
        response.setCreatedAt(route.getCreatedAt());

        // Parse JSON pickup_points
        response.setPickupPoints(parsePickupPoints(route.getPickupPoints()));

        // Parse JSON dropoff_points
        response.setDropoffPoints(parsePickupPoints(route.getDropoffPoints()));

        return response;
    }

    /**
     * Parse JSON string to List<PickupPoint>
     * Handles: NULL, empty string, "[]", invalid JSON
     */
    private List<RouteResponse.PickupPoint> parsePickupPoints(String json) {
        // Handle NULL or empty
        if (json == null || json.trim().isEmpty()) {
            log.debug("Pickup points is null or empty, returning empty list");
            return new ArrayList<>();
        }

        // Handle empty array "[]"
        if (json.trim().equals("[]")) {
            log.debug("Pickup points is empty array, returning empty list");
            return new ArrayList<>();
        }

        try {
            List<RouteResponse.PickupPoint> points = objectMapper.readValue(
                json,
                new TypeReference<List<RouteResponse.PickupPoint>>() {}
            );
            log.debug("Successfully parsed {} pickup points", points != null ? points.size() : 0);
            return points != null ? points : new ArrayList<>();
        } catch (Exception e) {
            log.error("Error parsing pickup points JSON: '{}' - Error: {}", json, e.getMessage());
            // Return empty list instead of throwing exception
            return new ArrayList<>();
        }
    }
    
    public void updateEntity(Route route, RouteRequest request) {
        route.setFromLocation(request.getFromLocation());
        route.setToLocation(request.getToLocation());
        route.setDistanceKm(request.getDistanceKm());
        route.setBasePrice(request.getBasePrice());
        route.setEstimatedDuration(request.getEstimatedDuration());
    }
}