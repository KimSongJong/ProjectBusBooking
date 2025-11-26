package com.busbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "invoice_number", unique = true, nullable = false, length = 50)
    private String invoiceNumber;

    @Column(name = "booking_group_id", nullable = false, length = 50)
    private String bookingGroupId;

    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "invoice_data", columnDefinition = "JSON")
    private String invoiceData;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
        if (invoiceNumber == null) {
            invoiceNumber = generateInvoiceNumber();
        }
    }

    /**
     * Generate invoice number in format: INV-YYYYMMDD-XXX
     * XXX is incremented based on invoices created today
     */
    private String generateInvoiceNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        // Simple format: INV-YYYYMMDD-{timestamp_last_3_digits}
        String timePart = String.format("%03d", System.currentTimeMillis() % 1000);
        return "INV-" + datePart + "-" + timePart;
    }
}

