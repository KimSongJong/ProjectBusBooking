package com.busbooking.payment.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
@SuppressWarnings("FieldMayBeFinal")
public class VNPayConfig {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.secretKey}")
    private String secretKey;

    @Value("${vnpay.apiUrl}")
    private String apiUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;
}

