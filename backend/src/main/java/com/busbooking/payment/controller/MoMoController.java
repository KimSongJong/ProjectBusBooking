package com.busbooking.payment.controller;

import com.busbooking.model.Payment;
import com.busbooking.model.Ticket;
import com.busbooking.payment.dto.PaymentRequest;
import com.busbooking.payment.dto.PaymentResponse;
import com.busbooking.payment.service.MoMoService;
import com.busbooking.repository.PaymentRepository;
import com.busbooking.repository.TicketRepository;
import com.busbooking.service.EmailService;
import com.busbooking.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
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
    private final TicketRepository ticketRepository;
    private final EmailService emailService;
    private final InvoiceService invoiceService;

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

                    // ⭐ STEP 2.5: Update all tickets to CONFIRMED status
                    String bookingGroupId = payment.getBookingGroupId();
                    log.info("🔍 [EMAIL DEBUG] Searching for tickets with booking_group_id: {}", bookingGroupId);

                    List<Ticket> tickets = ticketRepository.findByBookingGroupId(bookingGroupId);
                    log.info("🔍 [EMAIL DEBUG] Found {} tickets for booking_group_id: {}", tickets.size(), bookingGroupId);

                    if (!tickets.isEmpty()) {
                        tickets.forEach(ticket -> {
                            ticket.setStatus(Ticket.Status.confirmed);
                            ticket.setPaidAt(payment.getPaymentDate());
                            log.info("🎫 [EMAIL DEBUG] Updated ticket ID {} to CONFIRMED", ticket.getId());
                        });
                        ticketRepository.saveAll(tickets);
                        log.info("✅ Updated {} tickets to CONFIRMED for booking: {}", tickets.size(), bookingGroupId);

                        // ⭐ STEP 3: Send confirmation email ONLY AFTER payment completed + tickets confirmed
                        log.info("📧 [EMAIL DEBUG] About to call sendTicketAndInvoiceEmail...");
                        try {
                            sendTicketAndInvoiceEmail(payment, tickets);
                            log.info("✅ [EMAIL DEBUG] sendTicketAndInvoiceEmail completed successfully");
                        } catch (Exception emailError) {
                            log.error("❌ [EMAIL DEBUG] Failed to send confirmation email", emailError);
                            log.error("❌ [EMAIL DEBUG] Error message: {}", emailError.getMessage());
                            log.error("❌ [EMAIL DEBUG] Error stack trace:", emailError);
                        }
                    } else {
                        log.warn("⚠️ [EMAIL DEBUG] No tickets found for booking group: {}", bookingGroupId);
                        log.warn("⚠️ [EMAIL DEBUG] This means emails will NOT be sent!");
                        log.warn("⚠️ [EMAIL DEBUG] Check if tickets have correct booking_group_id in database");
                    }

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

    /**
     * ⭐ Send ONLY payment invoice email (NO ticket confirmation)
     * ONLY called AFTER payment_status = completed AND ticket_status = confirmed
     */
    private void sendTicketAndInvoiceEmail(Payment payment, List<Ticket> tickets) {
        try {
            if (tickets.isEmpty()) {
                log.warn("⚠️ No tickets to send email for booking: {}", payment.getBookingGroupId());
                return;
            }

            // ⭐ Get customer email from first ticket
            Ticket firstTicket = tickets.get(0);
            String customerEmail = firstTicket.getCustomerEmail();
            String customerName = firstTicket.getCustomerName();

            if (customerEmail == null || customerEmail.isEmpty()) {
                log.warn("⚠️ No email address for booking: {}", payment.getBookingGroupId());
                return;
            }

            log.info("📧 [INVOICE] Preparing to send invoice email to: {}", customerEmail);

            // ⭐ Prepare ticket details for invoice
            List<Map<String, Object>> ticketDetails = tickets.stream().map(ticket -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("ticketId", ticket.getId());
                detail.put("tripId", ticket.getTrip() != null ? ticket.getTrip().getId() : "N/A");
                detail.put("from", ticket.getTrip() != null && ticket.getTrip().getRoute() != null
                    ? ticket.getTrip().getRoute().getFromLocation() : "N/A");
                detail.put("to", ticket.getTrip() != null && ticket.getTrip().getRoute() != null
                    ? ticket.getTrip().getRoute().getToLocation() : "N/A");
                detail.put("departureTime", ticket.getTrip() != null
                    ? ticket.getTrip().getDepartureTime() : null);
                detail.put("seatNumber", ticket.getTripSeat() != null
                    ? ticket.getTripSeat().getSeatNumber() : "N/A");
                detail.put("pickupPoint", ticket.getPickupPoint());
                detail.put("dropoffPoint", ticket.getDropoffPoint());
                detail.put("price", ticket.getPrice());
                detail.put("tripType", ticket.getTripType());
                return detail;
            }).collect(java.util.stream.Collectors.toList());

            // ⭐ Prepare invoice data
            Map<String, Object> invoiceData = new HashMap<>();
            invoiceData.put("customerName", customerName != null ? customerName : "Quý khách");
            invoiceData.put("bookingGroupId", payment.getBookingGroupId());
            invoiceData.put("paymentId", payment.getId());
            invoiceData.put("totalAmount", payment.getAmount());
            invoiceData.put("paymentMethod", "MoMo");
            invoiceData.put("paymentDate", payment.getPaymentDate());
            invoiceData.put("paymentStatus", "Đã thanh toán");
            invoiceData.put("ticketCount", tickets.size());
            invoiceData.put("tickets", ticketDetails);

            // ⭐ Check if this is round trip
            boolean isRoundTrip = tickets.stream()
                .anyMatch(t -> "round_trip".equals(t.getTripType().name()));
            invoiceData.put("isRoundTrip", isRoundTrip);

            // ⭐ Send ONLY payment invoice email (NO ticket confirmation)
            emailService.sendPaymentInvoiceEmail(customerEmail, invoiceData);
            log.info("✅ [INVOICE] Payment invoice email sent to: {}", customerEmail);
            log.info("📧 [INVOICE] Booking: {} | Tickets: {} | Amount: {} | Email: {}",
                payment.getBookingGroupId(), tickets.size(), payment.getAmount(), customerEmail);

        } catch (Exception e) {
            log.error("❌ [INVOICE] Error sending invoice email for booking: {}",
                payment.getBookingGroupId(), e);
            // Don't throw - email failure shouldn't break payment flow
        }
    }
}

