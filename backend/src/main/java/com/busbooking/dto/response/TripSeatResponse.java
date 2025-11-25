package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripSeatResponse {
    private Integer id; // TripSeat ID
    private Integer tripId;
    private Integer seatId; // Seat ID - ADDED for booking creation
    private String seatNumber;
    private String seatType;
    private String status;
}
