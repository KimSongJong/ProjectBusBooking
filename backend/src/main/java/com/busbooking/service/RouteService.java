package com.busbooking.service;

import com.busbooking.dto.request.RouteRequest;
import com.busbooking.dto.response.RouteResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.RouteMapper;
import com.busbooking.model.Route;
import com.busbooking.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {
    
    private final RouteRepository routeRepository;
    private final RouteMapper routeMapper;
    
    public List<RouteResponse> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(routeMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public RouteResponse getRouteById(Integer id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        return routeMapper.toResponse(route);
    }
    
    public List<RouteResponse> searchRoutes(String from, String to) {
        List<Route> routes;
        if (from != null && to != null) {
            routes = routeRepository.findByFromLocationAndToLocation(from, to);
        } else if (from != null) {
            routes = routeRepository.findByFromLocation(from);
        } else if (to != null) {
            routes = routeRepository.findByToLocation(to);
        } else {
            routes = routeRepository.findAll();
        }
        return routes.stream()
                .map(routeMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public RouteResponse createRoute(RouteRequest request) {
        Route route = routeMapper.toEntity(request);
        Route savedRoute = routeRepository.save(route);
        return routeMapper.toResponse(savedRoute);
    }
    
    public RouteResponse updateRoute(Integer id, RouteRequest request) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        
        routeMapper.updateEntity(route, request);
        Route updatedRoute = routeRepository.save(route);
        return routeMapper.toResponse(updatedRoute);
    }
    
    public void deleteRoute(Integer id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        routeRepository.delete(route);
    }
}
