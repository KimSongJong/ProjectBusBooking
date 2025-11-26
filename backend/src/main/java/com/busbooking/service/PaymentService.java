package com.busbooking.service;

import com.busbooking.dto.request.PaymentRequest;
import com.busbooking.dto.response.PaymentResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.PaymentMapper;
import com.busbooking.model.Payment;
import com.busbooking.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(payment -> paymentMapper.toResponse(payment, true))
                .collect(Collectors.toList());
    }

    public PaymentResponse getPaymentById(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return paymentMapper.toResponse(payment, true);
    }

    public PaymentResponse getPaymentByBookingGroupId(String bookingGroupId) {
        Payment payment = paymentRepository.findByBookingGroupId(bookingGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking group: " + bookingGroupId));
        return paymentMapper.toResponse(payment, true);
    }

    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with transaction id: " + transactionId));
        return paymentMapper.toResponse(payment, true);
    }

    public List<PaymentResponse> getPaymentsByStatus(String status) {
        Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status);
        return paymentRepository.findByPaymentStatus(paymentStatus).stream()
                .map(payment -> paymentMapper.toResponse(payment, true))
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByMethod(String method) {
        Payment.PaymentMethod paymentMethod = Payment.PaymentMethod.valueOf(method);
        return paymentRepository.findByPaymentMethod(paymentMethod).stream()
                .map(payment -> paymentMapper.toResponse(payment, true))
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return paymentRepository.findByPaymentDateBetween(startDate, endDate).stream()
                .map(payment -> paymentMapper.toResponse(payment, true))
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        Payment payment = paymentMapper.toEntity(request);
        Payment saved = paymentRepository.save(payment);
        log.info("Created payment with id: {}", saved.getId());
        return paymentMapper.toResponse(saved, true);
    }

    @Transactional
    public PaymentResponse updatePaymentStatus(Integer id, String status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        Payment.PaymentStatus newStatus = Payment.PaymentStatus.valueOf(status);
        payment.setPaymentStatus(newStatus);

        if (newStatus == Payment.PaymentStatus.completed && payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDateTime.now());
        }

        Payment updated = paymentRepository.save(payment);
        log.info("Updated payment {} status to: {}", id, status);
        return paymentMapper.toResponse(updated, true);
    }

    @Transactional
    public PaymentResponse processRefund(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        if (payment.getPaymentStatus() != Payment.PaymentStatus.completed) {
            throw new IllegalStateException("Can only refund completed payments");
        }

        payment.setPaymentStatus(Payment.PaymentStatus.refunded);
        Payment updated = paymentRepository.save(payment);
        log.info("Refunded payment: {}", id);
        return paymentMapper.toResponse(updated, true);
    }

    public void deletePayment(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        paymentRepository.delete(payment);
        log.info("Deleted payment: {}", id);
    }

    // Stats methods
    public Map<String, Object> getPaymentStats() {
        Map<String, Object> stats = new HashMap<>();

        BigDecimal totalRevenue = paymentRepository.getTotalRevenue();
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        Long pendingCount = paymentRepository.countByStatus(Payment.PaymentStatus.pending);
        Long completedCount = paymentRepository.countByStatus(Payment.PaymentStatus.completed);
        Long failedCount = paymentRepository.countByStatus(Payment.PaymentStatus.failed);
        Long refundedCount = paymentRepository.countByStatus(Payment.PaymentStatus.refunded);

        stats.put("pendingCount", pendingCount);
        stats.put("completedCount", completedCount);
        stats.put("failedCount", failedCount);
        stats.put("refundedCount", refundedCount);

        // Today's revenue
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        BigDecimal todayRevenue = paymentRepository.getRevenueByDateRange(startOfDay, endOfDay);
        stats.put("todayRevenue", todayRevenue != null ? todayRevenue : BigDecimal.ZERO);

        return stats;
    }
}

