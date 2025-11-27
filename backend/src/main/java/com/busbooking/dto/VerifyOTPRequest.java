package com.busbooking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOTPRequest {

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "OTP code is required")
    private String otpCode;
}

