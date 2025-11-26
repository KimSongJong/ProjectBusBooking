package com.busbooking.service;

import com.busbooking.dto.response.TripSeatResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.model.Seat;
import com.busbooking.model.Trip;
import com.busbooking.model.TripSeat;
import com.busbooking.model.Vehicle;
import com.busbooking.repository.SeatRepository;
import com.busbooking.repository.TripRepository;
import com.busbooking.repository.TripSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripSeatService {
    
    private final TripSeatRepository tripSeatRepository;
    private final TripRepository tripRepository;
    private final SeatRepository seatRepository;
    
    /**
     * Tạo ghế cho trip mới từ template của vehicle
     */
    @Transactional
    public void createSeatsForTrip(Integer tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        
        Vehicle vehicle = trip.getVehicle();
        List<Seat> vehicleSeats = seatRepository.findByVehicleId(vehicle.getId());
        
        // Copy tất cả ghế từ vehicle sang trip_seats
        List<TripSeat> tripSeats = vehicleSeats.stream()
                .map(seat -> {
                    TripSeat tripSeat = new TripSeat();
                    tripSeat.setTrip(trip);
                    tripSeat.setSeat(seat); // ⭐ IMPORTANT: Link to Seat entity
                    tripSeat.setSeatNumber(seat.getSeatNumber());
                    tripSeat.setSeatType(TripSeat.SeatType.valueOf(seat.getSeatType().name()));
                    tripSeat.setStatus(TripSeat.SeatStatus.available);
                    return tripSeat;
                })
                .collect(Collectors.toList());
        
        tripSeatRepository.saveAll(tripSeats);
    }
    
    /**
     * Lấy tất cả ghế của một chuyến xe
     */
    public List<TripSeatResponse> getSeatsByTripId(Integer tripId) {
        List<TripSeat> tripSeats = tripSeatRepository.findByTripId(tripId);
        return tripSeats.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách ghế trống
     */
    public List<TripSeatResponse> getAvailableSeats(Integer tripId) {
        List<TripSeat> availableSeats = tripSeatRepository.findAvailableSeatsByTripId(tripId);
        return availableSeats.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Đếm số ghế trống
     */
    public Long countAvailableSeats(Integer tripId) {
        return tripSeatRepository.countAvailableSeatsByTripId(tripId);
    }
    
    /**
     * Đặt ghế
     */
    @Transactional
    public TripSeatResponse bookSeat(Integer tripSeatId) {
        TripSeat tripSeat = tripSeatRepository.findById(tripSeatId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip seat not found with id: " + tripSeatId));
        
        if (tripSeat.getStatus() != TripSeat.SeatStatus.available) {
            throw new IllegalStateException("Ghế đã được đặt hoặc bị khóa");
        }
        
        tripSeat.setStatus(TripSeat.SeatStatus.booked);
        TripSeat updated = tripSeatRepository.save(tripSeat);
        return toResponse(updated);
    }
    
    /**
     * Hủy đặt ghế (trả lại ghế về available)
     */
    @Transactional
    public TripSeatResponse cancelSeat(Integer tripSeatId) {
        TripSeat tripSeat = tripSeatRepository.findById(tripSeatId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip seat not found with id: " + tripSeatId));
        
        tripSeat.setStatus(TripSeat.SeatStatus.available);
        TripSeat updated = tripSeatRepository.save(tripSeat);
        return toResponse(updated);
    }
    
    /**
     * Khóa ghế vĩnh viễn (admin only)
     * Used for maintenance or disabled seats
     */
    @Transactional
    public TripSeatResponse lockSeat(Integer tripSeatId) {
        TripSeat tripSeat = tripSeatRepository.findById(tripSeatId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip seat not found with id: " + tripSeatId));
        
        tripSeat.setStatus(TripSeat.SeatStatus.locked);
        TripSeat updated = tripSeatRepository.save(tripSeat);
        return toResponse(updated);
    }


    private TripSeatResponse toResponse(TripSeat tripSeat) {
        // Get Seat ID directly from relationship (much simpler!)
        Integer seatId = tripSeat.getSeat() != null ? tripSeat.getSeat().getId() : null;

        return new TripSeatResponse(
                tripSeat.getId(),
                tripSeat.getTrip().getId(),
                seatId, // Seat ID for booking creation
                tripSeat.getSeatNumber(),
                tripSeat.getSeatType().name(),
                tripSeat.getStatus().name()
        );
    }
}
