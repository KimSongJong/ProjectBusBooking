package com.busbooking.mapper;

import com.busbooking.dto.request.PaymentRequest;
import com.busbooking.dto.response.PaymentResponse;
import com.busbooking.dto.response.TicketResponse;
import com.busbooking.model.Payment;
import com.busbooking.model.Ticket;
import com.busbooking.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentMapper {

    private final TicketRepository ticketRepository;
    private final TicketMapper ticketMapper;

    public Payment toEntity(PaymentRequest request) {
        Payment payment = new Payment();

        Ticket ticket = ticketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + request.getTicketId()));
        payment.setTicket(ticket);

        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setTransactionId(request.getTransactionId());

        return payment;
    }

    public PaymentResponse toResponse(Payment payment) {
        return toResponse(payment, true); // Include ticket by default
    }

    public PaymentResponse toResponse(Payment payment, boolean includeTicket) {
        TicketResponse ticketResponse = null;
        if (includeTicket && payment.getTicket() != null) {
            ticketResponse = ticketMapper.toResponse(payment.getTicket());
        }

        return new PaymentResponse(
                payment.getId(),
                payment.getTicket() != null ? payment.getTicket().getId() : null,
                ticketResponse,
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

