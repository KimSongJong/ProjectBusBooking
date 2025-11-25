package com.busbooking.dto.response;

import com.busbooking.dto.response.TicketResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Integer id;
    private Integer ticketId;
    private TicketResponse ticket; // Nested ticket info
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
}

