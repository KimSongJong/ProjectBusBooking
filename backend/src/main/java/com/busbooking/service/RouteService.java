package com.busbooking.service;

import com.busbooking.dto.request.RouteRequest;
import com.busbooking.dto.response.RouteResponse;
import com.busbooking.dto.response.ScheduleResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.RouteMapper;
import com.busbooking.model.Route;
import com.busbooking.model.Trip;
import com.busbooking.repository.RouteRepository;
import com.busbooking.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouteService {
    
    private final RouteRepository routeRepository;
    private final TripRepository tripRepository;
    private final RouteMapper routeMapper;
    private final OpenStreetMapService openStreetMapService;
    private final com.busbooking.repository.StationRepository stationRepository;

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
        // Kiểm tra điểm đi và điểm đến không được giống nhau
        if (request.getFromLocation().equalsIgnoreCase(request.getToLocation())) {
            throw new IllegalArgumentException("Điểm đi và điểm đến không được giống nhau");
        }
        
        // Kiểm tra tuyến đường đã tồn tại chưa
        if (routeRepository.existsByFromLocationAndToLocation(
                request.getFromLocation(), request.getToLocation())) {
            throw new IllegalArgumentException(
                String.format("Tuyến đường từ '%s' đến '%s' đã tồn tại!", 
                    request.getFromLocation(), request.getToLocation())
            );
        }
        
        Route route = routeMapper.toEntity(request);
        Route savedRoute = routeRepository.save(route);
        return routeMapper.toResponse(savedRoute);
    }
    
    public RouteResponse updateRoute(Integer id, RouteRequest request) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        
        // Kiểm tra điểm đi và điểm đến không được giống nhau
        if (request.getFromLocation().equalsIgnoreCase(request.getToLocation())) {
            throw new IllegalArgumentException("Điểm đi và điểm đến không được giống nhau");
        }
        
        // Kiểm tra tuyến đường đã tồn tại chưa (trừ chính nó)
        if (routeRepository.findByFromLocationAndToLocationAndIdNot(
                request.getFromLocation(), request.getToLocation(), id).isPresent()) {
            throw new IllegalArgumentException(
                String.format("Tuyến đường từ '%s' đến '%s' đã tồn tại!", 
                    request.getFromLocation(), request.getToLocation())
            );
        }
        
        // Chỉ cho phép cập nhật giá vé và thời gian ước tính
        route.setBasePrice(request.getBasePrice());
        route.setEstimatedDuration(request.getEstimatedDuration());
        
        Route updatedRoute = routeRepository.save(route);
        return routeMapper.toResponse(updatedRoute);
    }
    
    public List<ScheduleResponse> getSchedules() {
        List<Route> routes = routeRepository.findAll();
        
        return routes.stream().map(route -> {
            List<Trip> trips = tripRepository.findByRouteId(route.getId());
            
            // Lấy các loại xe duy nhất phục vụ tuyến này
            Set<String> vehicleTypes = trips.stream()
                    .filter(trip -> trip.getVehicle() != null && trip.getVehicle().getIsActive())
                    .map(trip -> getVehicleTypeLabel(trip.getVehicle().getVehicleType().name()))
                    .collect(Collectors.toSet());
            
            // Nếu không có chuyến nào hoặc không có xe active, để "---"
            if (vehicleTypes.isEmpty()) {
                vehicleTypes = new HashSet<>();
                vehicleTypes.add("---");
            }
            
            return new ScheduleResponse(
                    route.getId(),
                    route.getFromLocation(),
                    route.getToLocation(),
                    route.getDistanceKm(),
                    route.getBasePrice(),
                    route.getEstimatedDuration(),
                    vehicleTypes,
                    trips.size()
            );
        }).collect(Collectors.toList());
    }
    
    private String getVehicleTypeLabel(String type) {
        switch (type.toLowerCase()) {
            case "standard":
                return "Tiêu chuẩn";
            case "vip":
                return "VIP";
            case "sleeper":
                return "Giường nằm";
            default:
                return type;
        }
    }

    /**
     * Calculate route information from two stations using OpenStreetMap (OSRM)
     * @param fromStationId Origin station ID
     * @param toStationId Destination station ID
     * @return Route calculation with distance, duration, and price
     */
    public com.busbooking.dto.response.RouteCalculationResponse calculateRouteFromStations(
            Integer fromStationId,
            Integer toStationId
    ) {
        log.info("🔍 Calculating route from station {} to {}", fromStationId, toStationId);

        // Get stations
        com.busbooking.model.Station fromStation = stationRepository.findById(fromStationId)
                .orElseThrow(() -> {
                    log.error("❌ From station not found: {}", fromStationId);
                    return new ResourceNotFoundException("From station not found with id: " + fromStationId);
                });

        com.busbooking.model.Station toStation = stationRepository.findById(toStationId)
                .orElseThrow(() -> {
                    log.error("❌ To station not found: {}", toStationId);
                    return new ResourceNotFoundException("To station not found with id: " + toStationId);
                });

        log.info("✅ Found stations: {} → {}", fromStation.getName(), toStation.getName());

        // Calculate using OpenStreetMap (OSRM)
        Map<String, Object> calculation = openStreetMapService.calculateRouteInfo(
                fromStation.getLatitude(),
                fromStation.getLongitude(),
                toStation.getLatitude(),
                toStation.getLongitude()
        );

        // Build response
        com.busbooking.dto.response.RouteCalculationResponse response = new com.busbooking.dto.response.RouteCalculationResponse();
        response.setFromStationId(fromStation.getId());
        response.setFromStationName(fromStation.getName());
        response.setFromCity(fromStation.getCity());
        response.setToStationId(toStation.getId());
        response.setToStationName(toStation.getName());
        response.setToCity(toStation.getCity());
        response.setDistanceKm((java.math.BigDecimal) calculation.get("distanceKm"));
        response.setDurationMinutes((Integer) calculation.get("durationMinutes"));
        response.setBasePrice((java.math.BigDecimal) calculation.get("basePrice"));
        response.setCalculationSource((String) calculation.get("source"));
        response.setMessage("Route calculated successfully via OpenStreetMap");

        return response;
    }
}
