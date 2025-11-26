package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private Integer id;
    private String invoiceNumber;
    private String bookingGroupId;
    private PaymentResponse payment;
    private UserResponse user;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String invoiceData;
    private LocalDateTime issuedAt;
    private LocalDateTime createdAt;
}

