package com.busbooking.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotBlank(message = "Booking group ID is required")
    private String bookingGroupId;

    @NotNull(message = "Ticket count is required")
    @Min(value = 1, message = "Ticket count must be at least 1")
    private Integer ticketCount;

    @NotNull(message = "Amount is required")
    @Min(value = 1000, message = "Amount must be at least 1,000 VND")
    private Long amount;

    @NotBlank(message = "Order info is required")
    private String orderInfo;
}

