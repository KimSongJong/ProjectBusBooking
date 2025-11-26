package com.busbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    @NotBlank(message = "Booking group ID is required")
    private String bookingGroupId;

    private Integer paymentId;

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;

    private BigDecimal discountAmount;

    @NotNull(message = "Final amount is required")
    private BigDecimal finalAmount;

    private String invoiceData;
}

