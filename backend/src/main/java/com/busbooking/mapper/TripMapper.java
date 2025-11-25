package com.busbooking.mapper;

import com.busbooking.dto.request.TripRequest;
import com.busbooking.dto.response.TripResponse;
import com.busbooking.dto.response.RouteResponse;
import com.busbooking.dto.response.VehicleResponse;
import com.busbooking.dto.response.DriverResponse;
import com.busbooking.model.Trip;
import com.busbooking.model.Route;
import com.busbooking.model.Vehicle;
import com.busbooking.model.Driver;
import com.busbooking.repository.RouteRepository;
import com.busbooking.repository.VehicleRepository;
import com.busbooking.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TripMapper {
    
    @Autowired
    private RouteRepository routeRepository;
    
    @Autowired
    private VehicleRepository vehicleRepository;
    
    @Autowired
    private DriverRepository driverRepository;
    
    @Autowired
    private RouteMapper routeMapper;

    public Trip toEntity(TripRequest request) {
        Trip trip = new Trip();
        
        Route route = routeRepository.findById(request.getRouteId())
            .orElseThrow(() -> new RuntimeException("Route not found"));
        trip.setRoute(route);
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        trip.setVehicle(vehicle);
        
        Driver driver = driverRepository.findById(request.getDriverId())
            .orElseThrow(() -> new RuntimeException("Driver not found"));
        trip.setDriver(driver);
        
        trip.setDepartureTime(request.getDepartureTime());
        trip.setArrivalTime(request.getArrivalTime());
        trip.setStatus(Trip.Status.valueOf(request.getStatus()));
        
        return trip;
    }
    
    public TripResponse toResponse(Trip trip) {
        RouteResponse routeResponse = routeMapper.toResponse(trip.getRoute());

        VehicleResponse vehicleResponse = new VehicleResponse(
            trip.getVehicle().getId(),
            trip.getVehicle().getLicensePlate(),
            trip.getVehicle().getModel(),
            trip.getVehicle().getTotalSeats(),
            trip.getVehicle().getSeatsLayout(),
            trip.getVehicle().getVehicleType().name(),
            trip.getVehicle().getVehicleTypeDisplay(),
            trip.getVehicle().getIsActive(),
            trip.getVehicle().getCreatedAt()
        );
        
        DriverResponse driverResponse = new DriverResponse(
            trip.getDriver().getId(),
            trip.getDriver().getFullName(),
            trip.getDriver().getPhone(),
            trip.getDriver().getLicenseNumber(),
            trip.getDriver().getExperienceYears(),
            trip.getDriver().getImageUrl(),
            trip.getDriver().getIsActive(),
            trip.getDriver().getCreatedAt()
        );
        
        return new TripResponse(
            trip.getId(),
            routeResponse,
            vehicleResponse,
            driverResponse,
            trip.getDepartureTime(),
            trip.getArrivalTime(),
            trip.getStatus().name(),
            trip.getCreatedAt(),
            0L // availableSeats sẽ được set từ service layer
        );
    }
    
    public void updateEntity(Trip trip, TripRequest request) {
        Route route = routeRepository.findById(request.getRouteId())
            .orElseThrow(() -> new RuntimeException("Route not found"));
        trip.setRoute(route);
        
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
            .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        trip.setVehicle(vehicle);
        
        Driver driver = driverRepository.findById(request.getDriverId())
            .orElseThrow(() -> new RuntimeException("Driver not found"));
        trip.setDriver(driver);
        
        trip.setDepartureTime(request.getDepartureTime());
        trip.setArrivalTime(request.getArrivalTime());
        trip.setStatus(Trip.Status.valueOf(request.getStatus()));
    }
}
