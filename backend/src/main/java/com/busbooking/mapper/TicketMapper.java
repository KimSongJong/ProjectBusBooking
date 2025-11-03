package com.busbooking.mapper;

import com.busbooking.dto.request.TicketRequest;
import com.busbooking.dto.response.*;
import com.busbooking.model.*;
import com.busbooking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private SeatRepository seatRepository;
    
    @Autowired
    private PromotionRepository promotionRepository;
    
    public Ticket toEntity(TicketRequest request) {
        Ticket ticket = new Ticket();
        
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        ticket.setUser(user);
        
        Trip trip = tripRepository.findById(request.getTripId())
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        ticket.setTrip(trip);
        
        Seat seat = seatRepository.findById(request.getSeatId())
            .orElseThrow(() -> new RuntimeException("Seat not found"));
        ticket.setSeat(seat);
        
        if (request.getPromotionId() != null) {
            Promotion promotion = promotionRepository.findById(request.getPromotionId())
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
            ticket.setPromotion(promotion);
        }
        
        ticket.setPrice(request.getPrice());
        ticket.setBookingMethod(Ticket.BookingMethod.valueOf(request.getBookingMethod()));
        ticket.setStatus(Ticket.Status.valueOf(request.getStatus()));
        
        return ticket;
    }
    
    public TicketResponse toResponse(Ticket ticket) {
        UserResponse userResponse = new UserResponse(
            ticket.getUser().getId(),
            ticket.getUser().getUsername(),
            ticket.getUser().getEmail(),
            ticket.getUser().getRole().name(),
            ticket.getUser().getFullName(),
            ticket.getUser().getPhone(),
            ticket.getUser().getCreatedAt()
        );
        
        Trip trip = ticket.getTrip();
        RouteResponse routeResponse = new RouteResponse(
            trip.getRoute().getId(),
            trip.getRoute().getFromLocation(),
            trip.getRoute().getToLocation(),
            trip.getRoute().getDistanceKm(),
            trip.getRoute().getBasePrice(),
            trip.getRoute().getEstimatedDuration(),
            trip.getRoute().getCreatedAt()
        );
        
        VehicleResponse vehicleResponse = new VehicleResponse(
            trip.getVehicle().getId(),
            trip.getVehicle().getLicensePlate(),
            trip.getVehicle().getModel(),
            trip.getVehicle().getTotalSeats(),
            trip.getVehicle().getSeatsLayout(),
            trip.getVehicle().getVehicleType().name(),
            trip.getVehicle().getCreatedAt()
        );
        
        DriverResponse driverResponse = new DriverResponse(
            trip.getDriver().getId(),
            trip.getDriver().getFullName(),
            trip.getDriver().getPhone(),
            trip.getDriver().getLicenseNumber(),
            trip.getDriver().getExperienceYears(),
            trip.getDriver().getImageUrl(),
            trip.getDriver().getCreatedAt()
        );
        
        TripResponse tripResponse = new TripResponse(
            trip.getId(),
            routeResponse,
            vehicleResponse,
            driverResponse,
            trip.getDepartureTime(),
            trip.getArrivalTime(),
            trip.getStatus().name(),
            trip.getCreatedAt()
        );
        
        SeatResponse seatResponse = new SeatResponse(
            ticket.getSeat().getId(),
            ticket.getSeat().getVehicle().getId(),
            ticket.getSeat().getSeatNumber(),
            ticket.getSeat().getSeatType().name(),
            ticket.getSeat().getStatus().name()
        );
        
        PromotionResponse promotionResponse = null;
        if (ticket.getPromotion() != null) {
            promotionResponse = new PromotionResponse(
                ticket.getPromotion().getId(),
                ticket.getPromotion().getCode(),
                ticket.getPromotion().getDiscountPercentage(),
                ticket.getPromotion().getDiscountAmount(),
                ticket.getPromotion().getStartDate(),
                ticket.getPromotion().getEndDate(),
                ticket.getPromotion().getMaxUses(),
                ticket.getPromotion().getUsedCount(),
                ticket.getPromotion().getCreatedAt()
            );
        }
        
        return new TicketResponse(
            ticket.getId(),
            userResponse,
            tripResponse,
            seatResponse,
            promotionResponse,
            ticket.getPrice(),
            ticket.getBookingMethod().name(),
            ticket.getStatus().name(),
            ticket.getBookedAt(),
            ticket.getCancelledAt()
        );
    }
    
    public void updateEntity(Ticket ticket, TicketRequest request) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        ticket.setUser(user);
        
        Trip trip = tripRepository.findById(request.getTripId())
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        ticket.setTrip(trip);
        
        Seat seat = seatRepository.findById(request.getSeatId())
            .orElseThrow(() -> new RuntimeException("Seat not found"));
        ticket.setSeat(seat);
        
        if (request.getPromotionId() != null) {
            Promotion promotion = promotionRepository.findById(request.getPromotionId())
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
            ticket.setPromotion(promotion);
        } else {
            ticket.setPromotion(null);
        }
        
        ticket.setPrice(request.getPrice());
        ticket.setBookingMethod(Ticket.BookingMethod.valueOf(request.getBookingMethod()));
        ticket.setStatus(Ticket.Status.valueOf(request.getStatus()));
    }
}
