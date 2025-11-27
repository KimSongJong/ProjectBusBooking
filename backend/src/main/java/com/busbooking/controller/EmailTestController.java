package com.busbooking.controller;

import com.busbooking.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * ============================================
 * EMAIL TEST CONTROLLER
 * ============================================
 * Purpose: Test email sending functionality
 * Date: 2025-11-28
 * ============================================
 */
@RestController
@RequestMapping("/test/email")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EmailTestController {

    private final EmailService emailService;

    /**
     * Test endpoint - Send test email
     * Usage: GET http://localhost:8080/api/test/email/send?to=your-email@gmail.com
     */
    @GetMapping("/send")
    public ResponseEntity<Map<String, Object>> sendTestEmail(
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            String recipientEmail = to != null ? to : "12345levan@gmail.com"; // Default to sender email

            log.info("🧪 [TEST] Sending test email to: {}", recipientEmail);

            // Create mock ticket data
            Map<String, Object> ticketData = new HashMap<>();
            ticketData.put("bookingGroupId", "TEST-BOOKING-123");
            ticketData.put("customerName", "Test User");
            ticketData.put("ticketCount", 1);
            ticketData.put("totalAmount", "170,000đ");
            ticketData.put("fromLocation", "Hà Nội");
            ticketData.put("toLocation", "TP Hồ Chí Minh");
            ticketData.put("departureTime", "2025-11-28 08:00");
            ticketData.put("seatNumbers", "A01");

            // Send test email
            emailService.sendTicketConfirmationEmail(recipientEmail, ticketData);

            log.info("✅ [TEST] Test email sent successfully to: {}", recipientEmail);

            response.put("success", true);
            response.put("message", "Test email sent successfully!");
            response.put("sentTo", recipientEmail);
            response.put("note", "Please check your inbox and spam folder");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [TEST] Failed to send test email", e);

            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("note", "Check backend logs for details");

            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Test endpoint - Check email configuration
     * Usage: GET http://localhost:8080/api/test/email/config
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> checkEmailConfig() {
        Map<String, Object> response = new HashMap<>();

        try {
            // Get email config from environment
            String mailHost = System.getProperty("spring.mail.host", "smtp.gmail.com");
            String mailPort = System.getProperty("spring.mail.port", "587");
            String mailUsername = System.getProperty("spring.mail.username", "NOT_SET");

            response.put("success", true);
            response.put("mailHost", mailHost);
            response.put("mailPort", mailPort);
            response.put("mailUsername", mailUsername);
            response.put("note", "Email config loaded from application.properties");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

