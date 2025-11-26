package com.busbooking.mapper;

import com.busbooking.dto.request.PaymentRequest;
import com.busbooking.dto.response.PaymentResponse;
import com.busbooking.model.Payment;
import com.busbooking.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PaymentMapper {

    @Autowired
    private TicketRepository ticketRepository;

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
        // ✅ Fetch ticket IDs from database using booking_group_id
        List<Integer> ticketIds = Collections.emptyList();

        System.out.println("🔍 PaymentMapper.toResponse() called for payment #" + payment.getId());
        System.out.println("   booking_group_id: " + payment.getBookingGroupId());

        if (payment.getBookingGroupId() != null && !payment.getBookingGroupId().isEmpty()) {
            try {
                List<com.busbooking.model.Ticket> tickets = ticketRepository.findByBookingGroupId(payment.getBookingGroupId());
                System.out.println("   Found " + tickets.size() + " tickets for booking_group_id: " + payment.getBookingGroupId());

                ticketIds = tickets.stream()
                        .map(com.busbooking.model.Ticket::getId)
                        .collect(Collectors.toList());

                System.out.println("   Ticket IDs: " + ticketIds);
            } catch (Exception e) {
                System.err.println("❌ Error fetching ticket IDs for payment " + payment.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("   ⚠️ No booking_group_id for payment #" + payment.getId());
        }

        return new PaymentResponse(
                payment.getId(),
                payment.getBookingGroupId(),
                payment.getTicketCount(),
                ticketIds, // ✅ Ticket IDs from booking_group_id
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

