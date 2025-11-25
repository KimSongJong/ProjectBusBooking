package com.busbooking.mapper;

import com.busbooking.dto.request.TicketRequest;
import com.busbooking.dto.response.*;
import com.busbooking.model.*;
import com.busbooking.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TicketMapper {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private SeatRepository seatRepository;
    
    @Autowired
    private TripSeatRepository tripSeatRepository;

    @Autowired
    private PromotionRepository promotionRepository;
    
    @Autowired
    private RouteMapper routeMapper;

    public Ticket toEntity(TicketRequest request) {
        Ticket ticket = new Ticket();
        
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        ticket.setUser(user);
        
        Trip trip = tripRepository.findById(request.getTripId())
            .orElseThrow(() -> new RuntimeException("Trip not found"));
        ticket.setTrip(trip);
        
        // Find the Seat entity and TripSeat
        Seat seat = null;
        TripSeat tripSeat = null;

        if (request.getSeatId() != null) {
            // Try to find by seatId first
            log.info("🔍 Looking for Seat with ID: {}", request.getSeatId());
            try {
                seat = seatRepository.findById(request.getSeatId())
                    .orElse(null);

                if (seat != null) {
                    log.info("✅ Found Seat: {} (Number: {})", seat.getId(), seat.getSeatNumber());
                    ticket.setSeat(seat);

                    // Find the TripSeat for this trip and seat
                    log.info("🔍 Looking for TripSeat - TripID: {}, SeatID: {}", trip.getId(), seat.getId());
                    tripSeat = tripSeatRepository.findByTripIdAndSeatId(trip.getId(), seat.getId())
                        .orElse(null);
                }
            } catch (Exception e) {
                log.warn("⚠️ Could not find Seat with ID {}: {}", request.getSeatId(), e.getMessage());
            }
        }

        // If seat or tripSeat not found, try alternative approach
        if (tripSeat == null) {
            log.warn("⚠️ TripSeat not found via seatId, trying to find by tripId only");
            // List all available trip seats for this trip
            var availableTripSeats = tripSeatRepository.findAvailableSeatsByTripId(trip.getId());

            if (availableTripSeats.isEmpty()) {
                log.error("❌ No available seats for trip {}", trip.getId());
                throw new RuntimeException("No available seats for trip " + trip.getId());
            }

            // Take the first available seat
            tripSeat = availableTripSeats.get(0);
            log.info("✅ Using first available TripSeat: {} (seat: {})",
                tripSeat.getId(), tripSeat.getSeatNumber());

            // Get the actual Seat from TripSeat
            if (tripSeat.getSeat() != null) {
                seat = tripSeat.getSeat();
                ticket.setSeat(seat);
                log.info("✅ Found Seat from TripSeat: {} (Number: {})", seat.getId(), seat.getSeatNumber());
            }
        }

        if (tripSeat == null) {
            throw new RuntimeException("Could not find available seat for trip " + trip.getId());
        }

        ticket.setTripSeat(tripSeat);
        log.info("✅ Assigned TripSeat: {} for seat {}", tripSeat.getId(), tripSeat.getSeatNumber());

        // Update TripSeat status to 'booked'
        tripSeat.setStatus(TripSeat.SeatStatus.booked);
        tripSeatRepository.save(tripSeat);
        log.info("✅ Updated TripSeat {} status to BOOKED", tripSeat.getId());

        if (request.getPromotionId() != null) {
            Promotion promotion = promotionRepository.findById(request.getPromotionId())
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
            ticket.setPromotion(promotion);
        }
        
        // Set new fields
        ticket.setPickupPoint(request.getPickupPoint());
        ticket.setDropoffPoint(request.getDropoffPoint());
        ticket.setCustomerName(request.getCustomerName());
        ticket.setCustomerPhone(request.getCustomerPhone());
        ticket.setCustomerEmail(request.getCustomerEmail());
        ticket.setNotes(request.getNotes());

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
            ticket.getUser().getIsActive(),
            ticket.getUser().getCreatedAt()
        );
        
        Trip trip = ticket.getTrip();
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
        
        TripResponse tripResponse = new TripResponse(
            trip.getId(),
            routeResponse,
            vehicleResponse,
            driverResponse,
            trip.getDepartureTime(),
            trip.getArrivalTime(),
            trip.getStatus().name(),
            trip.getCreatedAt(),
            0L // availableSeats - set to 0 in ticket context since not needed
        );
        
        // Handle seat response - use tripSeat if seat is null
        SeatResponse seatResponse = null;
        if (ticket.getSeat() != null) {
            seatResponse = new SeatResponse(
                ticket.getSeat().getId(),
                ticket.getSeat().getVehicle().getId(),
                ticket.getSeat().getSeatNumber(),
                ticket.getSeat().getSeatType().name(),
                ticket.getSeat().getIsAvailable() != null && ticket.getSeat().getIsAvailable() ? "available" : "unavailable"
            );
        } else if (ticket.getTripSeat() != null) {
            // Fallback to tripSeat information
            TripSeat tripSeat = ticket.getTripSeat();
            if (tripSeat.getSeat() != null) {
                Seat seat = tripSeat.getSeat();
                seatResponse = new SeatResponse(
                    seat.getId(),
                    seat.getVehicle().getId(),
                    seat.getSeatNumber(),
                    seat.getSeatType().name(),
                    seat.getIsAvailable() != null && seat.getIsAvailable() ? "available" : "unavailable"
                );
            } else {
                // Create a minimal seat response from tripSeat data
                log.warn("⚠️ Ticket {} has no Seat reference, using TripSeat data", ticket.getId());
                seatResponse = new SeatResponse(
                    tripSeat.getId(),
                    trip.getVehicle().getId(),
                    tripSeat.getSeatNumber(),
                    tripSeat.getSeatType().name(),
                    tripSeat.getStatus().name()
                );
            }
        } else {
            // Ticket has no seat info - this can happen for old/incomplete tickets
            log.warn("⚠️ Ticket {} has no Seat or TripSeat reference, returning null for seat", ticket.getId());
            seatResponse = null; // Allow null seat response instead of throwing exception
        }

        PromotionResponse promotionResponse = null;
        if (ticket.getPromotion() != null) {
            Promotion promo = ticket.getPromotion();
            promotionResponse = new PromotionResponse(
                promo.getId(),
                promo.getCode(),
                promo.getDescription(),
                promo.getDiscountType() != null ? promo.getDiscountType().name() : null,
                promo.getDiscountValue(),
                promo.getMinAmount(),
                promo.getMaxDiscount(),
                promo.getStartDate(),
                promo.getEndDate(),
                promo.getUsageLimit(),
                promo.getUsedCount(),
                promo.getIsActive(),
                promo.getApplicableToRoundTrip(),
                promo.getCreatedAt()
            );
        }
        
        // Create TripSeatResponse if tripSeat exists
        TripSeatResponse tripSeatResponse = null;
        if (ticket.getTripSeat() != null) {
            TripSeat ts = ticket.getTripSeat();
            tripSeatResponse = new TripSeatResponse(
                ts.getId(),
                ts.getTrip().getId(),
                ts.getSeat() != null ? ts.getSeat().getId() : null,
                ts.getSeatNumber(),
                ts.getSeatType().name(),
                ts.getStatus().name()
            );
        }

        // ⭐ Map new round trip fields
        String tripType = ticket.getTripType() != null ? ticket.getTripType().name() : "ONE_WAY";
        Boolean isReturnTrip = ticket.getIsReturnTrip() != null ? ticket.getIsReturnTrip() : false;
        Integer linkedTicketId = ticket.getLinkedTicket() != null ? ticket.getLinkedTicket().getId() : null;
        String bookingGroupId = ticket.getBookingGroupId();

        return new TicketResponse(
            ticket.getId(),
            userResponse,
            tripResponse,
            seatResponse,
            tripSeatResponse,
            promotionResponse,
            ticket.getPickupPoint(),
            ticket.getDropoffPoint(),
            ticket.getCustomerName(),
            ticket.getCustomerPhone(),
            ticket.getCustomerEmail(),
            ticket.getNotes(),
            ticket.getPrice(),
            ticket.getBookingMethod().name(),
            ticket.getStatus().name(),
            ticket.getBookedAt(),
            ticket.getCancelledAt(),
            tripType,
            isReturnTrip,
            linkedTicketId,
            bookingGroupId
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
