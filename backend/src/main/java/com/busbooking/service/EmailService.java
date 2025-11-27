package com.busbooking.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send OTP verification email (with expiration time)
     */
    public void sendOtpEmail(String toEmail, String userName, String otpCode, java.time.LocalDateTime expiresAt) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🔐 Mã xác thực OTP - Bus Booking System");

            String emailBody = String.format(
                "Xin chào %s,\n\n" +
                "Cảm ơn bạn đã đăng ký tài khoản tại Bus Booking System!\n\n" +
                "Mã xác thực OTP của bạn là: %s\n\n" +
                "⏰ Mã này sẽ hết hạn lúc: %s\n\n" +
                "⚠️ Vui lòng KHÔNG chia sẻ mã này với bất kỳ ai.\n\n" +
                "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\n" +
                "Trân trọng,\n" +
                "Bus Booking System Team",
                userName != null ? userName : "Quý khách",
                otpCode,
                expiresAt != null ? expiresAt.toString() : "5 phút"
            );

            message.setText(emailBody);

            mailSender.send(message);
            log.info("✅ OTP email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("❌ Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    /**
     * Send OTP verification email (simple version without expiration)
     */
    public void sendOTPEmail(String toEmail, String userName, String otpCode) {
        sendOtpEmail(toEmail, userName, otpCode, null);
    }

    /**
     * Send welcome email after successful verification
     */
    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("🎉 Chào mừng đến với Bus Booking System!");

            String emailBody = String.format(
                "Xin chào %s,\n\n" +
                "✅ Tài khoản của bạn đã được xác thực thành công!\n\n" +
                "Bạn có thể đăng nhập và bắt đầu sử dụng dịch vụ đặt vé xe khách của chúng tôi.\n\n" +
                "🚌 Chúc bạn có những chuyến đi vui vẻ và an toàn!\n\n" +
                "Trân trọng,\n" +
                "Bus Booking System Team",
                userName != null ? userName : "Quý khách"
            );

            message.setText(emailBody);

            mailSender.send(message);
            log.info("✅ Welcome email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            log.error("❌ Failed to send welcome email to: {}", toEmail, e);
            // Don't throw exception - welcome email is not critical
        }
    }
}

