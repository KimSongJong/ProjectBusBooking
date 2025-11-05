package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {
    private Integer id;
    private RouteResponse route;
    private VehicleResponse vehicle;
    private DriverResponse driver;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private String status;
    private LocalDateTime createdAt;
    private Long availableSeats; // Số ghế còn trống
}
