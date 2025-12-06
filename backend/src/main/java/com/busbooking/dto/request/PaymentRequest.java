package com.busbooking.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Booking group ID is required")
    private String bookingGroupId;

    private Integer ticketCount;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private String paymentMethod; // credit_card, debit_card, cash, vnpay, momo, zalopay

    private String transactionId;

    // ⭐ ADD: Promotion code to track which promotion was applied
    private String promotionCode;

    // Explicit getter/setter for promotionCode (Lombok compatibility fix)
    public String getPromotionCode() {
        return promotionCode;
    }

    public void setPromotionCode(String promotionCode) {
        this.promotionCode = promotionCode;
    }
}

