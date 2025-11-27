package com.busbooking.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

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

    /**
     * Send HTML email using Thymeleaf template
     */
    private void sendHtmlEmail(String toEmail, String subject, String templateName, Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);

            // Process Thymeleaf template
            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process(templateName, context);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ HTML email sent successfully to: {} using template: {}", toEmail, templateName);

        } catch (MessagingException e) {
            log.error("❌ Failed to send HTML email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    /**
     * Send ticket confirmation email with HTML template
     */
    public void sendTicketConfirmationEmail(String toEmail, Map<String, Object> ticketData) {
        try {
            log.info("📧 [EMAIL] Sending ticket confirmation email to: {}", toEmail);
            log.info("📧 [EMAIL] Ticket data keys: {}", ticketData.keySet());
            log.info("📧 [EMAIL] Booking group ID: {}", ticketData.get("bookingGroupId"));
            log.info("📧 [EMAIL] Ticket count: {}", ticketData.get("ticketCount"));

            String subject = "🎉 Xác nhận đặt vé thành công - Bus Booking System";
            sendHtmlEmail(toEmail, subject, "email/ticket-confirmation", ticketData);

            log.info("✅ [EMAIL] Ticket confirmation email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("❌ [EMAIL] Failed to send ticket confirmation email to: {}", toEmail, e);
            log.error("❌ [EMAIL] Error message: {}", e.getMessage());
            log.error("❌ [EMAIL] Error stack:", e);
            // Don't throw exception - email failure shouldn't break booking flow
        }
    }

    /**
     * Send payment invoice email with HTML template
     */
    public void sendPaymentInvoiceEmail(String toEmail, Map<String, Object> invoiceData) {
        try {
            log.info("📧 [INVOICE] Sending payment invoice email to: {}", toEmail);
            log.info("📧 [INVOICE] Invoice data keys: {}", invoiceData.keySet());
            log.info("📧 [INVOICE] Booking group ID: {}", invoiceData.get("bookingGroupId"));
            log.info("📧 [INVOICE] Payment ID: {}", invoiceData.get("paymentId"));

            String subject = "🧾 Hóa đơn thanh toán - Bus Booking System";
            sendHtmlEmail(toEmail, subject, "email/payment-invoice", invoiceData);

            log.info("✅ [INVOICE] Payment invoice email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("❌ [INVOICE] Failed to send payment invoice email to: {}", toEmail, e);
            log.error("❌ [INVOICE] Error message: {}", e.getMessage());
            log.error("❌ [INVOICE] Error stack:", e);
            // Don't throw exception - email failure shouldn't break payment flow
        }
    }
}
