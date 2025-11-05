package com.busbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripRequest {
    
    @NotNull(message = "Route ID is required")
    @Positive(message = "Route ID must be positive")
    private Integer routeId;
    
    @NotNull(message = "Vehicle ID is required")
    @Positive(message = "Vehicle ID must be positive")
    private Integer vehicleId;
    
    @NotNull(message = "Driver ID is required")
    @Positive(message = "Driver ID must be positive")
    private Integer driverId;
    
    @NotNull(message = "Departure time is required")
    private LocalDateTime departureTime;
    
    private LocalDateTime arrivalTime;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(scheduled|ongoing|completed|cancelled)$", 
             message = "Status must be scheduled, ongoing, completed or cancelled")
    private String status; // scheduled, ongoing, completed, cancelled
}
