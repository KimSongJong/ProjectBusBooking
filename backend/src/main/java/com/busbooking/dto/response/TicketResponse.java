package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Integer id;
    private UserResponse user;
    private TripResponse trip;
    private SeatResponse seat;
    private TripSeatResponse tripSeat;
    private PromotionResponse promotion;
    private String pickupPoint;
    private String dropoffPoint;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String notes;
    private BigDecimal price;
    private String bookingMethod;
    private String status;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;

    // ⭐ NEW: Round trip support fields
    private String tripType; // ONE_WAY, ROUND_TRIP
    private Boolean isReturnTrip; // TRUE = vé về, FALSE = vé đi
    private Integer linkedTicketId; // ID của vé liên kết (vé đi ↔ vé về)
    private String bookingGroupId; // UUID để group vé đi + vé về
}
