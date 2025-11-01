package com.busbooking.mapper;

import com.busbooking.dto.request.RouteRequest;
import com.busbooking.dto.response.RouteResponse;
import com.busbooking.model.Route;
import org.springframework.stereotype.Component;

@Component
public class RouteMapper {
    
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
        return new RouteResponse(
            route.getId(),
            route.getFromLocation(),
            route.getToLocation(),
            route.getDistanceKm(),
            route.getBasePrice(),
            route.getEstimatedDuration(),
            route.getCreatedAt()
        );
    }
    
    public void updateEntity(Route route, RouteRequest request) {
        route.setFromLocation(request.getFromLocation());
        route.setToLocation(request.getToLocation());
        route.setDistanceKm(request.getDistanceKm());
        route.setBasePrice(request.getBasePrice());
        route.setEstimatedDuration(request.getEstimatedDuration());
    }
}