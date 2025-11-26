package com.busbooking.payment.controller;

import com.busbooking.model.Payment;
import com.busbooking.payment.dto.PaymentRequest;
import com.busbooking.payment.dto.PaymentResponse;
import com.busbooking.payment.service.MoMoService;
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
@RequestMapping("/payment/momo")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@SuppressWarnings("unused")
public class MoMoController {

    private final MoMoService moMoService;
    private final PaymentRepository paymentRepository;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        try {
            log.info("✅ Creating MoMo payment - BookingGroupId: {}, TicketCount: {}, Amount: {}",
                    request.getBookingGroupId(), request.getTicketCount(), request.getAmount());

            if (request.getAmount() < 1000) {
                return ResponseEntity.badRequest()
                        .body(PaymentResponse.error("Amount must be at least 1,000 VND"));
            }

            String orderId = request.getBookingGroupId() + "_" + System.currentTimeMillis();

            // ⭐ STEP 1: Create payment record with status PENDING
            Payment payment = new Payment();
            payment.setBookingGroupId(request.getBookingGroupId());
            payment.setTicketCount(request.getTicketCount());
            payment.setAmount(BigDecimal.valueOf(request.getAmount()));
            payment.setPaymentMethod(Payment.PaymentMethod.momo);
            payment.setPaymentStatus(Payment.PaymentStatus.pending);
            payment.setTransactionId(orderId); // Store orderId for later lookup

            Payment savedPayment = paymentRepository.save(payment);
            log.info("💾 Saved payment record with ID: {}, Status: pending", savedPayment.getId());

            // ⭐ STEP 2: Generate MoMo payment URL
            String paymentUrl = moMoService.createPaymentUrl(
                    orderId,
                    request.getAmount(),
                    request.getOrderInfo()
            );

            log.info("🔗 MoMo payment URL generated for order: {}", orderId);
            return ResponseEntity.ok(PaymentResponse.success(paymentUrl));

        } catch (Exception e) {
            log.error("❌ Error creating MoMo payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaymentResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/callback")
    public RedirectView callback(
            @RequestParam(required = false) String partnerCode,
            @RequestParam(required = false) String orderId,
            @RequestParam(required = false) String requestId,
            @RequestParam(required = false) Long amount,
            @RequestParam(required = false) String orderInfo,
            @RequestParam(required = false) String orderType,
            @RequestParam(required = false) Long transId,
            @RequestParam(required = false) Integer resultCode,
            @RequestParam(required = false) String message,
            @RequestParam(required = false) String payType,
            @RequestParam(required = false) Long responseTime,
            @RequestParam(required = false) String extraData,
            @RequestParam(required = false) String signature
    ) {
        try {
            log.info("📞 MoMo callback received - OrderId: {}, ResultCode: {}", orderId, resultCode);
            log.info("💳 MoMo Transaction ID: {}", transId);
            log.info("🕐 MoMo Response Time: {}", responseTime);

            // ⭐ STEP 1: Verify signature
            boolean isValid = moMoService.verifySignature(
                    partnerCode, orderId, requestId, amount, orderInfo, orderType,
                    transId, resultCode, message, payType, responseTime, extraData, signature
            );

            log.info("🔐 Signature valid: {}", isValid);
            log.info("📋 Result code: {}", resultCode);

            // ⭐ STEP 2: Update payment record in database
            paymentRepository.findByTransactionId(orderId).ifPresent(payment -> {
                if (isValid && resultCode == 0) {
                    // ✅ Payment SUCCESS
                    payment.setPaymentStatus(Payment.PaymentStatus.completed);

                    // ⭐ Parse MoMo response time (Unix timestamp in milliseconds → LocalDateTime)
                    if (responseTime != null && responseTime > 0) {
                        try {
                            LocalDateTime paymentTime = LocalDateTime.ofInstant(
                                java.time.Instant.ofEpochMilli(responseTime),
                                java.time.ZoneId.systemDefault()
                            );
                            payment.setPaymentDate(paymentTime);
                            log.info("✅ Payment date from MoMo: {}", paymentTime);
                        } catch (Exception e) {
                            log.warn("⚠️ Failed to parse responseTime, using server time: {}", e.getMessage());
                            payment.setPaymentDate(LocalDateTime.now());
                        }
                    } else {
                        log.warn("⚠️ No responseTime provided, using server time");
                        payment.setPaymentDate(LocalDateTime.now());
                    }

                    // ⭐ NOTE: Don't overwrite transaction_id!
                    // transaction_id is used to find payment record, keep it unchanged
                    // MoMo transaction ID is logged for debugging but not stored in DB
                    log.info("💳 MoMo Transaction ID: {}", transId);

                    log.info("✅ Updated payment ID {} to COMPLETED", payment.getId());
                } else {
                    // ❌ Payment FAILED
                    payment.setPaymentStatus(Payment.PaymentStatus.failed);
                    log.warn("❌ Updated payment ID {} to FAILED (resultCode: {})", payment.getId(), resultCode);
                }

                paymentRepository.save(payment);
            });

            // ⭐ STEP 3: Redirect to result page
            String status = isValid && resultCode == 0 ? "success" : "failed";
            log.info("🔄 Redirecting to result page with status: {}", status);

            return new RedirectView("http://localhost:5173/payment/result?status=" + status + "&orderId=" + orderId);

        } catch (Exception e) {
            log.error("❌ Error processing MoMo callback", e);
            return new RedirectView("http://localhost:5173/payment/result?status=error");
        }
    }

    @PostMapping("/ipn")
    public ResponseEntity<?> ipnHandler(@RequestBody Map<String, Object> payload) {
        log.info("MoMo IPN received: {}", payload);
        // TODO: Update ticket/payment status in database
        return ResponseEntity.ok().build();
    }
}

