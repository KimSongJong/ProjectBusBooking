package com.busbooking.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private String paymentUrl;
    private String status;
    private String message;

    public static PaymentResponse success(String paymentUrl) {
        return new PaymentResponse(paymentUrl, "success", "Payment URL created successfully");
    }

    public static PaymentResponse error(String message) {
        return new PaymentResponse(null, "error", message);
    }
}

