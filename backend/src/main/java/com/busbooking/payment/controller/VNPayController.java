package com.busbooking.payment.controller;

import com.busbooking.model.Payment;
import com.busbooking.payment.dto.PaymentRequest;
import com.busbooking.payment.dto.PaymentResponse;
import com.busbooking.payment.service.VNPayService;
import com.busbooking.repository.PaymentRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/payment/vnpay")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@SuppressWarnings("unused")
public class VNPayController {

    private final VNPayService vnPayService;
    private final PaymentRepository paymentRepository;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        try {
            log.info("✅ Creating VNPay payment - BookingGroupId: {}, TicketCount: {}, Amount: {}",
                    request.getBookingGroupId(), request.getTicketCount(), request.getAmount());

            String orderId = request.getBookingGroupId() + "_" + System.currentTimeMillis();

            // ⭐ STEP 1: Create payment record with status PENDING
            Payment payment = new Payment();
            payment.setBookingGroupId(request.getBookingGroupId());
            payment.setTicketCount(request.getTicketCount());
            payment.setAmount(BigDecimal.valueOf(request.getAmount()));
            payment.setPaymentMethod(Payment.PaymentMethod.vnpay);
            payment.setPaymentStatus(Payment.PaymentStatus.pending);
            payment.setTransactionId(orderId); // Store orderId for later lookup

            Payment savedPayment = paymentRepository.save(payment);
            log.info("💾 Saved payment record with ID: {}, Status: pending", savedPayment.getId());

            // ⭐ STEP 2: Generate VNPay payment URL
            String paymentUrl = vnPayService.createPaymentUrl(
                    orderId,
                    request.getAmount(),
                    request.getOrderInfo()
            );

            log.info("🔗 VNPay payment URL generated for order: {}", orderId);
            return ResponseEntity.ok(PaymentResponse.success(paymentUrl));

        } catch (Exception e) {
            log.error("❌ Error creating VNPay payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaymentResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/callback")
    public RedirectView callback(@RequestParam Map<String, String> params) {
        try {
            log.info("📞 VNPay callback received");
            log.info("📦 Callback params: {}", params);

            // ⭐ STEP 1: Verify signature
            boolean isValid = vnPayService.verifySignature(params);
            String responseCode = params.get("vnp_ResponseCode");
            String orderId = params.get("vnp_TxnRef");
            String vnpTransactionNo = params.get("vnp_TransactionNo"); // VNPay transaction ID
            String vnpAmount = params.get("vnp_Amount"); // Amount in VND * 100

            log.info("🔐 Signature valid: {}", isValid);
            log.info("📋 Response code: {}", responseCode);
            log.info("🆔 Order ID: {}", orderId);
            log.info("💳 VNPay Transaction No: {}", vnpTransactionNo);

            // ⭐ STEP 2: Update payment record in database
            paymentRepository.findByTransactionId(orderId).ifPresent(payment -> {
                if (isValid && "00".equals(responseCode)) {
                    // ✅ Payment SUCCESS
                    payment.setPaymentStatus(Payment.PaymentStatus.completed);
                    payment.setPaymentDate(LocalDateTime.now());

                    // Store VNPay transaction number for reference
                    if (vnpTransactionNo != null) {
                        payment.setTransactionId(orderId + "|" + vnpTransactionNo);
                    }

                    log.info("✅ Updated payment ID {} to COMPLETED", payment.getId());
                } else {
                    // ❌ Payment FAILED
                    payment.setPaymentStatus(Payment.PaymentStatus.failed);
                    log.warn("❌ Updated payment ID {} to FAILED (responseCode: {})", payment.getId(), responseCode);
                }

                paymentRepository.save(payment);
            });

            // ⭐ STEP 3: Redirect to result page
            String status = isValid && "00".equals(responseCode) ? "success" : "failed";
            log.info("🔄 Redirecting to result page with status: {}", status);

            return new RedirectView("http://localhost:5173/payment/result?status=" + status + "&orderId=" + orderId);

        } catch (Exception e) {
            log.error("❌ Error processing VNPay callback", e);
            return new RedirectView("http://localhost:5173/payment/result?status=error");
        }
    }
}

