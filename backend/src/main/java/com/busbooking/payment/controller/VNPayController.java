package com.busbooking.payment.controller;

import com.busbooking.payment.dto.PaymentRequest;
import com.busbooking.payment.dto.PaymentResponse;
import com.busbooking.payment.service.VNPayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping("/payment/vnpay")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@SuppressWarnings("unused")
public class VNPayController {

    private final VNPayService vnPayService;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        try {
            log.info("Creating VNPay payment - BookingGroupId: {}, TicketCount: {}, Amount: {}",
                    request.getBookingGroupId(), request.getTicketCount(), request.getAmount());

            String orderId = request.getBookingGroupId() + "_" + System.currentTimeMillis();

            String paymentUrl = vnPayService.createPaymentUrl(
                    orderId,
                    request.getAmount(),
                    request.getOrderInfo()
            );

            return ResponseEntity.ok(PaymentResponse.success(paymentUrl));

        } catch (Exception e) {
            log.error("Error creating VNPay payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaymentResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/callback")
    public RedirectView callback(@RequestParam Map<String, String> params) {
        try {
            log.info("VNPay callback received");

            boolean isValid = vnPayService.verifySignature(params);
            String responseCode = params.get("vnp_ResponseCode");

            String status = isValid && "00".equals(responseCode) ? "success" : "failed";
            String orderId = params.get("vnp_TxnRef");

            log.info("Payment {} - OrderId: {}", status, orderId);

            return new RedirectView("http://localhost:5173/payment/result?status=" + status + "&orderId=" + orderId);

        } catch (Exception e) {
            log.error("Error processing VNPay callback", e);
            return new RedirectView("http://localhost:5173/payment/result?status=error");
        }
    }
}

