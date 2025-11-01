package com.busbooking.service;

import com.busbooking.dto.request.TripRequest;
import com.busbooking.dto.response.TripResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.TripMapper;
import com.busbooking.model.Trip;
import com.busbooking.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {
    
    private final TripRepository tripRepository;
    private final TripMapper tripMapper;
    
    public List<TripResponse> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public TripResponse getTripById(Integer id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        return tripMapper.toResponse(trip);
    }
    
    public List<TripResponse> getTripsByRoute(Integer routeId) {
        return tripRepository.findByRouteId(routeId).stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<TripResponse> getTripsByStatus(String status) {
        Trip.Status tripStatus = Trip.Status.valueOf(status);
        return tripRepository.findByStatus(tripStatus).stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<TripResponse> getTripsInDateRange(LocalDateTime start, LocalDateTime end) {
        return tripRepository.findByDepartureTimeBetween(start, end).stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public TripResponse createTrip(TripRequest request) {
        Trip trip = tripMapper.toEntity(request);
        Trip savedTrip = tripRepository.save(trip);
        return tripMapper.toResponse(savedTrip);
    }
    
    public TripResponse updateTrip(Integer id, TripRequest request) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        
        tripMapper.updateEntity(trip, request);
        Trip updatedTrip = tripRepository.save(trip);
        return tripMapper.toResponse(updatedTrip);
    }
    
    public void deleteTrip(Integer id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        tripRepository.delete(trip);
    }
}
