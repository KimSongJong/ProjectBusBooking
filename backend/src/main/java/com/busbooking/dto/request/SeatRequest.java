package com.busbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatRequest {
    
    @NotNull(message = "Vehicle ID is required")
    private Integer vehicleId;
    
    @NotBlank(message = "Seat number is required")
    private String seatNumber;
    
    @NotBlank(message = "Seat type is required")
    private String seatType; // standard, vip, bed
    
    private String status; // available, booked, unavailable
}
