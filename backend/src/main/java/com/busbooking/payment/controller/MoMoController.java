package com.busbooking.payment.controller;

import com.busbooking.payment.dto.PaymentRequest;
import com.busbooking.payment.dto.PaymentResponse;
import com.busbooking.payment.service.MoMoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping("/payment/momo")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@SuppressWarnings("unused")
public class MoMoController {

    private final MoMoService moMoService;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        try {
            log.info("Creating MoMo payment - TicketId: {}, Amount: {}", request.getTicketId(), request.getAmount());

            if (request.getAmount() < 1000) {
                return ResponseEntity.badRequest()
                        .body(PaymentResponse.error("Amount must be at least 1,000 VND"));
            }

            String orderId = "TICKET_" + request.getTicketId() + "_" + System.currentTimeMillis();

            String paymentUrl = moMoService.createPaymentUrl(
                    orderId,
                    request.getAmount(),
                    request.getOrderInfo()
            );

            return ResponseEntity.ok(PaymentResponse.success(paymentUrl));

        } catch (Exception e) {
            log.error("Error creating MoMo payment", e);
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
            log.info("MoMo callback received - OrderId: {}, ResultCode: {}", orderId, resultCode);

            boolean isValid = moMoService.verifySignature(
                    partnerCode, orderId, requestId, amount, orderInfo, orderType,
                    transId, resultCode, message, payType, responseTime, extraData, signature
            );

            String status = isValid && resultCode == 0 ? "success" : "failed";

            log.info("Payment {} - OrderId: {}", status, orderId);

            return new RedirectView("http://localhost:5173/payment/result?status=" + status + "&orderId=" + orderId);

        } catch (Exception e) {
            log.error("Error processing MoMo callback", e);
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

