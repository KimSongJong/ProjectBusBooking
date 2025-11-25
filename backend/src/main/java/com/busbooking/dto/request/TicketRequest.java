package com.busbooking.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequest {
    
    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be positive")
    private Integer userId;
    
    @NotNull(message = "Trip ID is required")
    @Positive(message = "Trip ID must be positive")
    private Integer tripId;
    
    @NotNull(message = "Seat ID is required")
    @Positive(message = "Seat ID must be positive")
    private Integer seatId;
    
    @Positive(message = "Promotion ID must be positive")
    private Integer promotionId;
    
    private String pickupPoint;

    private String dropoffPoint;

    private String customerName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String customerPhone;

    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@(.+)$", message = "Invalid email format")
    private String customerEmail;

    private String notes;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "10000.0", message = "Price must be at least 10,000 VND")
    @DecimalMax(value = "10000000.0", message = "Price must not exceed 10,000,000 VND")
    private BigDecimal price;
    
    @NotBlank(message = "Booking method is required")
    @Pattern(regexp = "^(online|offline)$", message = "Booking method must be online or offline")
    private String bookingMethod; // online, offline
    
    @Pattern(regexp = "^(booked|confirmed|cancelled)$", message = "Status must be booked, confirmed or cancelled")
    private String status; // booked, confirmed, cancelled
}
