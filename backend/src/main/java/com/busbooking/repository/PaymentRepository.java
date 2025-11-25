package com.busbooking.repository;

import com.busbooking.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    // Find by ticket ID
    Optional<Payment> findByTicketId(Integer ticketId);

    // Find by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);

    // Find by payment status
    List<Payment> findByPaymentStatus(Payment.PaymentStatus status);

    // Find by payment method
    List<Payment> findByPaymentMethod(Payment.PaymentMethod method);

    // Find by date range
    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    List<Payment> findByPaymentDateBetween(@Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

    // Get total revenue
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'completed'")
    BigDecimal getTotalRevenue();

    // Get revenue by date range
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentStatus = 'completed' " +
           "AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal getRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);

    // Count by status
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = :status")
    Long countByStatus(@Param("status") Payment.PaymentStatus status);
}

