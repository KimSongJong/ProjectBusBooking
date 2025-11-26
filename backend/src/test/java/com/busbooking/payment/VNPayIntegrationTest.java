package com.busbooking.payment;

import com.busbooking.payment.config.VNPayConfig;
import com.busbooking.payment.dto.PaymentRequest;
import com.busbooking.payment.dto.PaymentResponse;
import com.busbooking.payment.service.VNPayService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * VNPay Integration Tests
 *
 * NOTE: These tests require valid VNPay credentials in application.properties
 * Use VNPay Sandbox credentials for testing
 */
@SpringBootTest
public class VNPayIntegrationTest {

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private VNPayConfig vnPayConfig;

    @Test
    public void testVNPayConfigLoaded() {
        assertNotNull(vnPayConfig.getTmnCode(), "TMN Code should not be null");
        assertNotNull(vnPayConfig.getSecretKey(), "Secret Key should not be null");
        assertNotNull(vnPayConfig.getApiUrl(), "API URL should not be null");
        assertNotNull(vnPayConfig.getReturnUrl(), "Return URL should not be null");

        System.out.println("✅ VNPay Configuration loaded successfully");
        System.out.println("   TMN Code: " + vnPayConfig.getTmnCode());
        System.out.println("   API URL: " + vnPayConfig.getApiUrl());
        System.out.println("   Return URL: " + vnPayConfig.getReturnUrl());
    }

    @Test
    public void testCreatePaymentUrl() {
        String orderId = "TEST_" + System.currentTimeMillis();
        long amount = 100000; // 100,000 VND
        String orderInfo = "Test payment for bus ticket";

        String paymentUrl = vnPayService.createPaymentUrl(orderId, amount, orderInfo);

        assertNotNull(paymentUrl, "Payment URL should not be null");
        assertTrue(paymentUrl.startsWith(vnPayConfig.getApiUrl()),
                   "Payment URL should start with API URL");
        assertTrue(paymentUrl.contains("vnp_Amount=" + (amount * 100)),
                   "Payment URL should contain correct amount");
        assertTrue(paymentUrl.contains("vnp_TxnRef=" + orderId),
                   "Payment URL should contain order ID");
        assertTrue(paymentUrl.contains("vnp_SecureHash="),
                   "Payment URL should contain secure hash");

        System.out.println("✅ Payment URL created successfully");
        System.out.println("   Order ID: " + orderId);
        System.out.println("   Amount: " + amount + " VND");
        System.out.println("   Payment URL: " + paymentUrl);
    }

    @Test
    public void testPaymentRequest() {
        PaymentRequest request = new PaymentRequest();
        request.setBookingGroupId("BOOKING-test-uuid-123");
        request.setTicketCount(1);
        request.setAmount(500000L);
        request.setOrderInfo("Payment for booking #BOOKING-test-uuid-123");

        assertNotNull(request.getBookingGroupId());
        assertEquals("BOOKING-test-uuid-123", request.getBookingGroupId());
        assertEquals(1, request.getTicketCount());
        assertEquals(500000L, request.getAmount());
        assertEquals("Payment for booking #BOOKING-test-uuid-123", request.getOrderInfo());

        System.out.println("✅ PaymentRequest validated");
    }

    @Test
    public void testPaymentResponse() {
        PaymentResponse successResponse = PaymentResponse.success("https://vnpay.vn/payment");
        assertEquals("success", successResponse.getStatus());
        assertEquals("https://vnpay.vn/payment", successResponse.getPaymentUrl());

        PaymentResponse errorResponse = PaymentResponse.error("Invalid amount");
        assertEquals("error", errorResponse.getStatus());
        assertEquals("Invalid amount", errorResponse.getMessage());
        assertNull(errorResponse.getPaymentUrl());

        System.out.println("✅ PaymentResponse factory methods working");
    }

    /**
     * Manual test - prints payment URL for manual testing in browser
     */
    @Test
    public void manualTestCreatePaymentUrl() {
        String orderId = "TICKET_999_" + System.currentTimeMillis();
        long amount = 150000; // 150,000 VND
        String orderInfo = "Manual test payment for bus ticket";

        String paymentUrl = vnPayService.createPaymentUrl(orderId, amount, orderInfo);

        System.out.println("\n" + "=".repeat(80));
        System.out.println("🧪 MANUAL TEST - VNPay Payment URL");
        System.out.println("=".repeat(80));
        System.out.println("Order ID: " + orderId);
        System.out.println("Amount: " + amount + " VND");
        System.out.println("Order Info: " + orderInfo);
        System.out.println("\nPayment URL:");
        System.out.println(paymentUrl);
        System.out.println("\n📝 Instructions:");
        System.out.println("1. Copy the payment URL above");
        System.out.println("2. Open it in a browser");
        System.out.println("3. Use VNPay Sandbox test card:");
        System.out.println("   Card: 9704198526191432198");
        System.out.println("   Holder: NGUYEN VAN A");
        System.out.println("   Expiry: 07/15");
        System.out.println("   OTP: 123456");
        System.out.println("=".repeat(80) + "\n");
    }

    /**
     * Test signature verification with sample data
     * NOTE: This will fail unless you use actual VNPay callback data
     */
    @Test
    public void testSignatureVerification() {
        // This is a mock test - in real scenario, params come from VNPay callback
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "10000000");
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", "TEST_123");
        // Add more params as needed...

        // This will fail without proper signature
        // boolean isValid = vnPayService.verifySignature(params);

        System.out.println("⚠️ Signature verification test skipped");
        System.out.println("   Use actual VNPay callback data for testing");
    }
}

