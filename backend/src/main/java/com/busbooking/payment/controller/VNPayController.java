package com.busbooking.payment.controller;

import com.busbooking.model.Payment;
import com.busbooking.model.Ticket;
import com.busbooking.payment.dto.PaymentRequest;
import com.busbooking.payment.dto.PaymentResponse;
import com.busbooking.payment.service.VNPayService;
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
@RequestMapping("/payment/vnpay")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@SuppressWarnings("unused")
public class VNPayController {

    private final VNPayService vnPayService;
    private final PaymentRepository paymentRepository;
    private final TicketRepository ticketRepository;
    private final EmailService emailService;
    private final InvoiceService invoiceService;

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
            String vnpPayDate = params.get("vnp_PayDate"); // ⭐ Payment time from VNPay (format: yyyyMMddHHmmss)

            log.info("🔐 Signature valid: {}", isValid);
            log.info("📋 Response code: {}", responseCode);
            log.info("🆔 Order ID: {}", orderId);
            log.info("💳 VNPay Transaction No: {}", vnpTransactionNo);
            log.info("🕐 VNPay Payment Date: {}", vnpPayDate);

            // ⭐ STEP 2: Update payment record in database
            paymentRepository.findByTransactionId(orderId).ifPresent(payment -> {
                if (isValid && "00".equals(responseCode)) {
                    // ✅ Payment SUCCESS
                    payment.setPaymentStatus(Payment.PaymentStatus.completed);

                    // ⭐ Parse VNPay payment date (format: yyyyMMddHHmmss → LocalDateTime)
                    if (vnpPayDate != null && vnpPayDate.length() == 14) {
                        try {
                            int year = Integer.parseInt(vnpPayDate.substring(0, 4));
                            int month = Integer.parseInt(vnpPayDate.substring(4, 6));
                            int day = Integer.parseInt(vnpPayDate.substring(6, 8));
                            int hour = Integer.parseInt(vnpPayDate.substring(8, 10));
                            int minute = Integer.parseInt(vnpPayDate.substring(10, 12));
                            int second = Integer.parseInt(vnpPayDate.substring(12, 14));

                            LocalDateTime paymentTime = LocalDateTime.of(year, month, day, hour, minute, second);
                            payment.setPaymentDate(paymentTime);
                            log.info("✅ Payment date from VNPay: {}", paymentTime);
                        } catch (Exception e) {
                            log.warn("⚠️ Failed to parse vnp_PayDate, using server time: {}", e.getMessage());
                            payment.setPaymentDate(LocalDateTime.now());
                        }
                    } else {
                        log.warn("⚠️ No vnp_PayDate provided, using server time");
                        payment.setPaymentDate(LocalDateTime.now());
                    }

                    // ⭐ NOTE: Don't overwrite transaction_id!
                    // transaction_id is used to find payment record, keep it unchanged
                    // VNPay transaction number is logged for debugging but not stored in DB
                    log.info("💳 VNPay Transaction No: {}", vnpTransactionNo);

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
            invoiceData.put("paymentMethod", "VNPay");
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

