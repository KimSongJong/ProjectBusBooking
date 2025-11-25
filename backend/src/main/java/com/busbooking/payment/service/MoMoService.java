package com.busbooking.payment.service;

import com.busbooking.payment.config.MoMoConfig;
import com.busbooking.payment.dto.MoMoPaymentRequest;
import com.busbooking.payment.dto.MoMoPaymentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("unused")
public class MoMoService {

    private final MoMoConfig moMoConfig;
    private final RestTemplate restTemplate;

    public String createPaymentUrl(String orderId, long amount, String orderInfo) {
        try {
            log.info("=== Creating MoMo payment URL ===");
            log.info("Order ID: {}", orderId);
            log.info("Amount: {}", amount);
            log.info("Order Info: {}", orderInfo);

            String requestId = UUID.randomUUID().toString();
            String extraData = ""; // Must be empty string, not null
            String requestType = "captureWallet";

            // Log config
            log.info("Partner Code: {}", moMoConfig.getPartnerCode());
            log.info("Access Key: {}", moMoConfig.getAccessKey());
            log.info("Return URL: {}", moMoConfig.getReturnUrl());
            log.info("IPN URL: {}", moMoConfig.getNotifyUrl());

            // Build raw signature EXACTLY as MoMo documentation (alphabetical order)
            String rawSignature = "accessKey=" + moMoConfig.getAccessKey() +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + moMoConfig.getNotifyUrl() +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + moMoConfig.getPartnerCode() +
                    "&redirectUrl=" + moMoConfig.getReturnUrl() +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            log.info("Raw signature string: {}", rawSignature);

            // Generate signature
            String signature = hmacSHA256(rawSignature, moMoConfig.getSecretKey());
            log.info("Generated signature: {}", signature);

            // Build request
            MoMoPaymentRequest request = MoMoPaymentRequest.builder()
                    .partnerCode(moMoConfig.getPartnerCode())
                    .accessKey(moMoConfig.getAccessKey())
                    .requestId(requestId)
                    .amount(amount)
                    .orderId(orderId)
                    .orderInfo(orderInfo)
                    .redirectUrl(moMoConfig.getReturnUrl())
                    .ipnUrl(moMoConfig.getNotifyUrl())
                    .requestType(requestType)
                    .extraData(extraData)
                    .lang("vi")
                    .signature(signature)
                    .build();

            log.info("Sending request to MoMo API: {}", moMoConfig.getApiUrl());

            // Send request to MoMo
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<MoMoPaymentRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<MoMoPaymentResponse> response = restTemplate.exchange(
                    moMoConfig.getApiUrl(),
                    HttpMethod.POST,
                    entity,
                    MoMoPaymentResponse.class
            );

            MoMoPaymentResponse moMoResponse = response.getBody();

            if (moMoResponse == null) {
                log.error("❌ MoMo API returned null response");
                throw new RuntimeException("MoMo API returned null response");
            }

            log.info("✅ MoMo API Response:");
            log.info("  - Result Code: {}", moMoResponse.getResultCode());
            log.info("  - Message: {}", moMoResponse.getMessage());
            log.info("  - Pay URL: {}", moMoResponse.getPayUrl());

            if (moMoResponse.getResultCode() != 0) {
                log.error("❌ MoMo error code {}: {}", moMoResponse.getResultCode(), moMoResponse.getMessage());
                throw new RuntimeException("MoMo error (code " + moMoResponse.getResultCode() + "): " + moMoResponse.getMessage());
            }

            log.info("✅ MoMo payment URL created successfully");
            return moMoResponse.getPayUrl();

        } catch (Exception e) {
            log.error("Error creating MoMo payment URL", e);
            throw new RuntimeException("Failed to create MoMo payment: " + e.getMessage(), e);
        }
    }

    public boolean verifySignature(String partnerCode, String orderId, String requestId,
                                    Long amount, String orderInfo, String orderType,
                                    Long transId, Integer resultCode, String message,
                                    String payType, Long responseTime, String extraData,
                                    String receivedSignature) {
        try {
            String rawSignature = "accessKey=" + moMoConfig.getAccessKey() +
                    "&amount=" + amount +
                    "&extraData=" + (extraData != null ? extraData : "") +
                    "&message=" + message +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&orderType=" + orderType +
                    "&partnerCode=" + partnerCode +
                    "&payType=" + payType +
                    "&requestId=" + requestId +
                    "&responseTime=" + responseTime +
                    "&resultCode=" + resultCode +
                    "&transId=" + transId;

            String calculatedSignature = hmacSHA256(rawSignature, moMoConfig.getSecretKey());

            return calculatedSignature.equalsIgnoreCase(receivedSignature);

        } catch (Exception e) {
            log.error("Error verifying MoMo signature", e);
            return false;
        }
    }

    private String hmacSHA256(String data, String key) {
        try {
            Mac hmac256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac256.init(secretKey);
            byte[] hashBytes = hmac256.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hash.append('0');
                hash.append(hex);
            }

            return hash.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA256", e);
        }
    }
}

