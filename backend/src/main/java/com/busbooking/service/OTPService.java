package com.busbooking.service;

import com.busbooking.model.User;
import com.busbooking.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@Slf4j
public class OTPService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;

    /**
     * Generate 6-digit OTP code
     */
    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // Range: 100000-999999
        return String.valueOf(otp);
    }

    /**
     * Generate OTP and send email
     * @param user User to send OTP to
     * @return Generated OTP code (for testing/logging only)
     */
    public String generateAndSendOTP(User user) {
        try {
            // Generate OTP
            String otpCode = generateOTP();
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

            // Save OTP to database
            user.setOtpCode(otpCode);
            user.setOtpExpiresAt(expiresAt);
            userRepository.save(user);

            // Send OTP email
            emailService.sendOTPEmail(user.getEmail(), user.getFullName(), otpCode);

            log.info("✅ OTP generated and sent to: {} (expires at: {})", user.getEmail(), expiresAt);
            return otpCode; // Return for testing purposes

        } catch (Exception e) {
            log.error("❌ Failed to generate/send OTP for user: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Verify OTP code
     * @param user User to verify
     * @param otpCode OTP code entered by user
     * @return true if OTP is valid, false otherwise
     */
    public boolean verifyOTP(User user, String otpCode) {
        // Check if OTP exists
        if (user.getOtpCode() == null || user.getOtpExpiresAt() == null) {
            log.warn("⚠️ No OTP found for user: {}", user.getEmail());
            return false;
        }

        // Check if OTP expired
        if (LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
            log.warn("⚠️ OTP expired for user: {} (expired at: {})", user.getEmail(), user.getOtpExpiresAt());
            return false;
        }

        // Check if OTP matches
        if (!user.getOtpCode().equals(otpCode)) {
            log.warn("⚠️ Invalid OTP for user: {} (expected: {}, got: {})",
                user.getEmail(), user.getOtpCode(), otpCode);
            return false;
        }

        // OTP is valid
        log.info("✅ OTP verified successfully for user: {}", user.getEmail());

        // Mark email as verified and clear OTP
        user.setEmailVerified(true);
        user.setIsActive(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return true;
    }

    /**
     * Resend OTP (for "Resend Code" button)
     */
    public void resendOTP(User user) {
        log.info("🔄 Resending OTP to: {}", user.getEmail());
        generateAndSendOTP(user);
    }
}

