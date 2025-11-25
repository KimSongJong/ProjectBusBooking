package com.busbooking.payment.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
@SuppressWarnings("FieldMayBeFinal")
public class MoMoConfig {

    @Value("${momo.partnerCode}")
    private String partnerCode;

    @Value("${momo.accessKey}")
    private String accessKey;

    @Value("${momo.secretKey}")
    private String secretKey;

    @Value("${momo.apiUrl}")
    private String apiUrl;

    @Value("${momo.returnUrl}")
    private String returnUrl;

    @Value("${momo.notifyUrl}")
    private String notifyUrl;
}

