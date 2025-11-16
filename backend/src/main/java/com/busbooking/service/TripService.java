package com.busbooking.service;

import com.busbooking.dto.request.TripRequest;
import com.busbooking.dto.response.ScheduleGroupResponse;
import com.busbooking.dto.response.TripResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.TripMapper;
import com.busbooking.model.Driver;
import com.busbooking.model.Route;
import com.busbooking.model.Trip;
import com.busbooking.repository.DriverRepository;
import com.busbooking.repository.RouteRepository;
import com.busbooking.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {
    
    private final TripRepository tripRepository;
    private final TripMapper tripMapper;
    private final DriverRepository driverRepository;
    private final RouteRepository routeRepository;
    private final TripSeatService tripSeatService;
    
    public List<TripResponse> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(trip -> {
                    TripResponse response = tripMapper.toResponse(trip);
                    response.setAvailableSeats(tripSeatService.countAvailableSeats(trip.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public TripResponse getTripById(Integer id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        TripResponse response = tripMapper.toResponse(trip);
        response.setAvailableSeats(tripSeatService.countAvailableSeats(trip.getId()));
        return response;
    }
    
    public List<TripResponse> getTripsByRoute(Integer routeId) {
        return tripRepository.findByRouteId(routeId).stream()
                .map(trip -> {
                    TripResponse response = tripMapper.toResponse(trip);
                    response.setAvailableSeats(tripSeatService.countAvailableSeats(trip.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public List<TripResponse> getTripsByStatus(String status) {
        Trip.Status tripStatus = Trip.Status.valueOf(status);
        return tripRepository.findByStatus(tripStatus).stream()
                .map(trip -> {
                    TripResponse response = tripMapper.toResponse(trip);
                    response.setAvailableSeats(tripSeatService.countAvailableSeats(trip.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    public List<TripResponse> getTripsInDateRange(LocalDateTime start, LocalDateTime end) {
        return tripRepository.findByDepartureTimeBetween(start, end).stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public TripResponse createTrip(TripRequest request) {
        // Kiểm tra driver có đang hoạt động không
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        if (!driver.getIsActive()) {
            throw new IllegalArgumentException("Tài xế đang nghỉ, không thể tạo chuyến xe");
        }
        
        // Lấy thông tin route để tính arrivalTime
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        
        // Tính thời gian kết thúc dựa trên thời gian khởi hành + thời gian ước tính
        LocalDateTime departureTime = request.getDepartureTime();
        LocalDateTime arrivalTime = departureTime.plusMinutes(route.getEstimatedDuration());
        
        // Kiểm tra xung đột lịch trình của tài xế
        List<Trip> conflictingTrips = tripRepository.findDriverTripsInTimeRange(
                request.getDriverId(),
                departureTime,
                arrivalTime
        );
        
        if (!conflictingTrips.isEmpty()) {
            throw new IllegalArgumentException(
                    "Tài xế đã có lịch trình từ " + departureTime + " đến " + arrivalTime + 
                    ". Không thể thêm chuyến xe trùng thời gian."
            );
        }
        
        Trip trip = tripMapper.toEntity(request);
        trip.setArrivalTime(arrivalTime); // Set thời gian kết thúc
        Trip savedTrip = tripRepository.save(trip);
        
        // Tự động tạo ghế cho chuyến xe mới
        try {
            tripSeatService.createSeatsForTrip(savedTrip.getId());
        } catch (Exception e) {
            // Log error nhưng không fail transaction
            System.err.println("Error creating seats for trip: " + e.getMessage());
        }
        
        return tripMapper.toResponse(savedTrip);
    }
    
    public TripResponse updateTrip(Integer id, TripRequest request) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        
        // Kiểm tra nếu chuyến xe đang chạy hoặc đã hoàn thành thì không cho phép sửa
        if (trip.getStatus() == Trip.Status.ongoing || trip.getStatus() == Trip.Status.completed) {
            throw new IllegalArgumentException("Không thể cập nhật chuyến xe đang chạy hoặc đã hoàn thành");
        }
        
        // Kiểm tra driver có đang hoạt động không
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        if (!driver.getIsActive()) {
            throw new IllegalArgumentException("Tài xế đang nghỉ, không thể cập nhật chuyến xe");
        }
        
        // Lấy thông tin route để tính arrivalTime
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
        
        // Tính thời gian kết thúc dựa trên thời gian khởi hành + thời gian ước tính
        LocalDateTime departureTime = request.getDepartureTime();
        LocalDateTime arrivalTime = departureTime.plusMinutes(route.getEstimatedDuration());
        
        // Kiểm tra xung đột lịch trình của tài xế (trừ chuyến xe hiện tại)
        List<Trip> conflictingTrips = tripRepository.findDriverTripsInTimeRangeExcludingTrip(
                request.getDriverId(),
                id,
                departureTime,
                arrivalTime
        );
        
        if (!conflictingTrips.isEmpty()) {
            throw new IllegalArgumentException(
                    "Tài xế đã có lịch trình từ " + departureTime + " đến " + arrivalTime + 
                    ". Không thể cập nhật chuyến xe trùng thời gian."
            );
        }
        
        tripMapper.updateEntity(trip, request);
        trip.setArrivalTime(arrivalTime); // Cập nhật thời gian kết thúc
        Trip updatedTrip = tripRepository.save(trip);
        return tripMapper.toResponse(updatedTrip);
    }
    
    public List<ScheduleGroupResponse> getScheduleRoutes() {
        // Chỉ lấy các chuyến đã lên lịch
        List<Trip> scheduledTrips = tripRepository.findAll().stream()
                .filter(trip -> Trip.Status.scheduled.equals(trip.getStatus()))
                .collect(Collectors.toList());
        
        // Nhóm trips theo điểm đi (fromLocation)
        Map<String, List<Trip>> tripsByFromLocation = scheduledTrips.stream()
                .collect(Collectors.groupingBy(trip -> trip.getRoute().getFromLocation()));
        
        // Tạo ScheduleGroupResponse cho mỗi điểm đi
        return tripsByFromLocation.entrySet().stream()
                .map(fromEntry -> {
                    String fromLocation = fromEntry.getKey();
                    List<Trip> tripsFromLocation = fromEntry.getValue();
                    
                    // Nhóm theo route (điểm đến) trong cùng điểm đi
                    Map<Route, List<Trip>> tripsByRoute = tripsFromLocation.stream()
                            .collect(Collectors.groupingBy(Trip::getRoute));
                    
                    // Tạo danh sách điểm đến
                    List<ScheduleGroupResponse.DestinationInfo> destinations = tripsByRoute.entrySet().stream()
                            .map(routeEntry -> {
                                Route route = routeEntry.getKey();
                                List<Trip> trips = routeEntry.getValue();
                                
                                // Lấy danh sách loại xe unique từ các chuyến scheduled
                                List<String> vehicleTypes = trips.stream()
                                        .map(trip -> trip.getVehicle().getVehicleType().name())
                                        .distinct()
                                        .collect(Collectors.toList());
                                
                                return new ScheduleGroupResponse.DestinationInfo(
                                        route.getId(),
                                        route.getToLocation(),
                                        route.getDistanceKm().toString() + "km",
                                        formatDuration(route.getEstimatedDuration()),
                                        formatPrice(route.getBasePrice()),
                                        vehicleTypes
                                );
                            })
                            .collect(Collectors.toList());
                    
                    return new ScheduleGroupResponse(fromLocation, destinations);
                })
                .collect(Collectors.toList());
    }
    
    private String formatDuration(Integer minutes) {
        int hours = minutes / 60;
        int mins = minutes % 60;
        return mins > 0 ? hours + " giờ " + mins + " phút" : hours + " giờ";
    }
    
    private String formatPrice(BigDecimal price) {
        return price.toString() + " VNĐ";
    }
}
