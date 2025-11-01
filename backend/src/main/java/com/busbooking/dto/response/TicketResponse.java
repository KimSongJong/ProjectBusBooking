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
    private PromotionResponse promotion;
    private BigDecimal price;
    private String bookingMethod;
    private String status;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;
}
