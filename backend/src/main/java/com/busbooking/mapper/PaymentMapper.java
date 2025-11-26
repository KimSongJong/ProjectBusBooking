package com.busbooking.mapper;

import com.busbooking.dto.request.PaymentRequest;
import com.busbooking.dto.response.PaymentResponse;
import com.busbooking.model.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {


    public Payment toEntity(PaymentRequest request) {
        Payment payment = new Payment();

        payment.setBookingGroupId(request.getBookingGroupId());
        payment.setTicketCount(request.getTicketCount() != null ? request.getTicketCount() : 1);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setTransactionId(request.getTransactionId());

        return payment;
    }

    public PaymentResponse toResponse(Payment payment) {
        return toResponse(payment, true);
    }

    public PaymentResponse toResponse(Payment payment, boolean includeTicket) {
        // includeTicket parameter kept for backward compatibility but no longer used
        return new PaymentResponse(
                payment.getId(),
                payment.getBookingGroupId(),
                payment.getTicketCount(),
                payment.getAmount(),
                payment.getPaymentMethod().name(),
                payment.getPaymentStatus().name(),
                payment.getTransactionId(),
                payment.getPaymentDate(),
                payment.getCreatedAt()
        );
    }

    public void updateEntity(Payment payment, PaymentRequest request) {
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setTransactionId(request.getTransactionId());
    }
}

