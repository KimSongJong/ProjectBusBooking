package com.busbooking.dto;

import com.busbooking.model.Ticket;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoundTripBookingRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Trip type is required")
    private Ticket.TripType tripType;

    // Outbound trip (chuyến đi)
    @NotNull(message = "Outbound trip ID is required")
    private Long outboundTripId;

    @NotNull(message = "Outbound seats are required")
    private List<String> outboundSeats;

    private String outboundPickupLocation;
    private String outboundDropoffLocation;

    // Return trip (chuyến về) - optional, chỉ có khi tripType = ROUND_TRIP
    private Long returnTripId;
    private List<String> returnSeats;
    private String returnPickupLocation;
    private String returnDropoffLocation;

    // Common customer info
    @NotNull(message = "Customer name is required")
    private String customerName;

    @NotNull(message = "Customer phone is required")
    private String customerPhone;

    @NotNull(message = "Customer email is required")
    private String customerEmail;

    private String notes;
}

