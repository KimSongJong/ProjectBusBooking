package com.busbooking.mapper;

import com.busbooking.dto.request.SeatRequest;
import com.busbooking.dto.response.SeatResponse;
import com.busbooking.model.Seat;
import org.springframework.stereotype.Component;

@Component
public class SeatMapper {

    public Seat toEntity(SeatRequest request) {
        Seat s = new Seat();
        // Seat has vehicle relation; service will set vehicle by id if needed
        s.setSeatNumber(request.getSeatNumber());
        s.setSeatType(Seat.SeatType.valueOf(request.getSeatType()));
        // Convert status string to boolean if needed
        if (request.getStatus() != null) {
            s.setIsAvailable("available".equalsIgnoreCase(request.getStatus()));
        }
        return s;
    }

    public SeatResponse toResponse(Seat s) {
        Integer vehicleId = s.getVehicle() != null ? s.getVehicle().getId() : null;
        return new SeatResponse(
                s.getId(),
                vehicleId,
                s.getSeatNumber(),
                s.getSeatType().name(),
                s.getIsAvailable() != null && s.getIsAvailable() ? "available" : "unavailable"
        );
    }

    public void updateEntity(Seat s, SeatRequest request) {
        s.setSeatNumber(request.getSeatNumber());
        s.setSeatType(Seat.SeatType.valueOf(request.getSeatType()));
        if (request.getStatus() != null) {
            s.setIsAvailable("available".equalsIgnoreCase(request.getStatus()));
        }
    }
}
