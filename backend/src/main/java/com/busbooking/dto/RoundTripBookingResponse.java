package com.busbooking.dto;

import com.busbooking.dto.response.TicketResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoundTripBookingResponse {

    private String bookingGroupId;

    private List<TicketResponse> outboundTickets;

    private List<TicketResponse> returnTickets;

    private String tripType; // ONE_WAY, ROUND_TRIP

    private Long totalPrice;

    private Long discountAmount;

    private Long finalPrice;

    private Integer totalSeats;

    private String message;

    private Boolean success;

    // Constructor for one-way ticket
    public RoundTripBookingResponse(
            String bookingGroupId,
            List<TicketResponse> outboundTickets,
            String tripType,
            long totalPrice,
            int totalSeats
    ) {
        this.bookingGroupId = bookingGroupId;
        this.outboundTickets = outboundTickets;
        this.returnTickets = null;
        this.tripType = tripType;
        this.totalPrice = totalPrice;
        this.totalSeats = totalSeats;
        this.success = true;
        this.message = "Booking created successfully";
    }

    // Constructor for round-trip ticket
    public static RoundTripBookingResponse forRoundTrip(
            String bookingGroupId,
            List<TicketResponse> outboundTickets,
            List<TicketResponse> returnTickets,
            long totalPrice,
            int totalSeats
    ) {
        RoundTripBookingResponse response = new RoundTripBookingResponse();
        response.setBookingGroupId(bookingGroupId);
        response.setOutboundTickets(outboundTickets);
        response.setReturnTickets(returnTickets);
        response.setTripType("ROUND_TRIP");

        // Calculate original total (before discount)
        long originalTotal = outboundTickets.stream()
                .mapToLong(t -> t.getPrice().longValue())
                .sum();
        originalTotal += returnTickets.stream()
                .mapToLong(t -> t.getPrice().longValue())
                .sum();

        // Calculate discount (10%) and final price
        long discount = (long)(originalTotal * 0.1);
        long finalPrice = originalTotal - discount;

        response.setTotalPrice(originalTotal);
        response.setDiscountAmount(discount);
        response.setFinalPrice(finalPrice);
        response.setTotalSeats(totalSeats);
        response.setSuccess(true);
        response.setMessage("Round trip booking created successfully with 10% discount");
        return response;
    }
}

