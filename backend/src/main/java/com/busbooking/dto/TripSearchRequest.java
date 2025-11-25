package com.busbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripSearchRequest {
    private String fromLocation;
    private String toLocation;
    private LocalDateTime departureDate;
    private LocalDateTime returnDate;  // Null for one-way trip
    private Integer passengers;
    private String vehicleType;  // Optional filter: standard, vip, bed
    private String tripType;  // "oneWay" or "roundTrip"
}

