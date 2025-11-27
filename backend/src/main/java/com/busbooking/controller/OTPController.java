package com.busbooking.controller;

import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.ResendOTPRequest;
import com.busbooking.dto.VerifyOTPRequest;
import com.busbooking.model.User;
import com.busbooking.repository.UserRepository;
import com.busbooking.service.EmailService;
import com.busbooking.service.OTPService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/otp")
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class OTPController {

    @Autowired
    private OTPService otpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Verify OTP code
     * POST /api/auth/otp/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyOTP(@Valid @RequestBody VerifyOTPRequest request) {
        try {
            log.info("🔍 Verifying OTP for email: {}", request.getEmail());

            // Find user by email
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Verify OTP
            boolean isValid = otpService.verifyOTP(user, request.getOtpCode());

            if (!isValid) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Mã OTP không chính xác hoặc đã hết hạn")
                );
            }

            // Send welcome email
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

            // Return success response
            Map<String, Object> data = new HashMap<>();
            data.put("verified", true);
            data.put("message", "Email đã được xác thực thành công!");

            log.info("✅ OTP verified successfully for: {}", request.getEmail());

            return ResponseEntity.ok(
                ApiResponse.success("OTP verification successful", data)
            );

        } catch (Exception e) {
            log.error("❌ OTP verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Xác thực OTP thất bại: " + e.getMessage())
            );
        }
    }

    /**
     * Resend OTP code
     * POST /api/auth/otp/resend
     */
    @PostMapping("/resend")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resendOTP(@RequestBody ResendOTPRequest request) {
        try {
            log.info("🔄 Resending OTP to: {}", request.getEmail());

            // Find user by email
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if already verified
            if (Boolean.TRUE.equals(user.getEmailVerified())) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Email đã được xác thực rồi")
                );
            }

            // Resend OTP
            otpService.resendOTP(user);

            Map<String, Object> data = new HashMap<>();
            data.put("sent", true);
            data.put("message", "Mã OTP mới đã được gửi đến email của bạn");

            log.info("✅ OTP resent successfully to: {}", request.getEmail());

            return ResponseEntity.ok(
                ApiResponse.success("OTP resent successfully", data)
            );

        } catch (Exception e) {
            log.error("❌ Failed to resend OTP: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Không thể gửi lại mã OTP: " + e.getMessage())
            );
        }
    }

    /**
     * Check OTP status (for debugging)
     * GET /api/auth/otp/status?email=xxx
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkOTPStatus(@RequestParam String email) {
        try {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> data = new HashMap<>();
            data.put("email", user.getEmail());
            data.put("emailVerified", user.getEmailVerified());
            data.put("hasOTP", user.getOtpCode() != null);
            data.put("otpExpiresAt", user.getOtpExpiresAt());

            return ResponseEntity.ok(
                ApiResponse.success("OTP status retrieved", data)
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Failed to get OTP status: " + e.getMessage())
            );
        }
    }
}

