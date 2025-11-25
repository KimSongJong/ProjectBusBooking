package com.busbooking.payment.service;

import com.busbooking.payment.config.VNPayConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("unused")
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    public String createPaymentUrl(String orderId, long amount, String orderInfo) {
        try {
            log.info("Creating VNPay payment URL for order: {}, amount: {}", orderId, amount);

            // Create parameters map - TreeMap auto-sorts by key (required for VNPay signature)
            Map<String, String> vnpParams = new TreeMap<>();

            // REQUIRED parameters (must be present for signature)
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // VNPay requires amount * 100
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", orderId);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", "127.0.0.1"); // IPv4 format required

            // Create date and expiry date in GMT+7
            Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

            String vnpCreateDate = formatter.format(calendar.getTime());
            vnpParams.put("vnp_CreateDate", vnpCreateDate);

            // Add expiry date (15 minutes from now) - RECOMMENDED by VNPay
            calendar.add(Calendar.MINUTE, 15);
            String vnpExpireDate = formatter.format(calendar.getTime());
            vnpParams.put("vnp_ExpireDate", vnpExpireDate);

            // Build hash data and query string
            // Based on VNPay official demo and Node.js working example
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);

            for (String fieldName : fieldNames) {
                String fieldValue = vnpParams.get(fieldName);

                // Skip null or empty values (like in Node.js example)
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    // Build hash data (for signature)
                    if (hashData.length() > 0) {
                        hashData.append('&');
                        query.append('&');
                    }

                    // Hash data: URLEncoded values (this is the key!)
                    // Node.js example shows: value.toString() with UTF-8
                    try {
                        String encodedValue = java.net.URLEncoder.encode(fieldValue, StandardCharsets.UTF_8);

                        // Both hash data and query use SAME encoded value
                        hashData.append(java.net.URLEncoder.encode(fieldName, StandardCharsets.UTF_8))
                                .append('=')
                                .append(encodedValue);

                        query.append(java.net.URLEncoder.encode(fieldName, StandardCharsets.UTF_8))
                             .append('=')
                             .append(encodedValue);
                    } catch (Exception e) {
                        log.error("Error encoding parameter: {}", fieldName, e);
                    }
                }
            }

            log.debug("=== VNPay Debug Info ===");
            log.debug("TMN Code: {}", vnPayConfig.getTmnCode());
            log.debug("Secret Key (first 10 chars): {}...", vnPayConfig.getSecretKey().substring(0, 10));
            log.debug("Hash data: {}", hashData);

            // Create signature from encoded hash data
            String vnpSecureHash = hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
            log.debug("Signature: {}", vnpSecureHash);

            // Build payment URL
            String paymentUrl = vnPayConfig.getApiUrl() + "?" + query + "&vnp_SecureHash=" + vnpSecureHash;

            log.info("VNPay payment URL created successfully for order: {}", orderId);
            log.debug("Payment URL: {}", paymentUrl);

            log.info("VNPay payment URL created successfully for order: {}", orderId);
            log.debug("Payment URL: {}", paymentUrl);

            return paymentUrl;

        } catch (Exception e) {
            log.error("Error creating VNPay payment URL for order: {}", orderId, e);
            throw new RuntimeException("Failed to create VNPay payment URL: " + e.getMessage(), e);
        }
    }

    public boolean verifySignature(Map<String, String> params) {
        try {
            String vnpSecureHash = params.get("vnp_SecureHash");
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            // Sort parameters
            Map<String, String> sortedParams = new TreeMap<>(params);

            // Build hash data
            StringBuilder hashData = new StringBuilder();
            for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
                if (!hashData.isEmpty()) {
                    hashData.append('&');
                }
                hashData.append(entry.getKey()).append('=').append(entry.getValue());
            }

            // Calculate signature
            String calculatedHash = hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());

            log.debug("Received hash: {}", vnpSecureHash);
            log.debug("Calculated hash: {}", calculatedHash);

            return calculatedHash.equalsIgnoreCase(vnpSecureHash);

        } catch (Exception e) {
            log.error("Error verifying VNPay signature", e);
            return false;
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] hashBytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hash.append('0');
                hash.append(hex);
            }

            return hash.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA512", e);
        }
    }
}

