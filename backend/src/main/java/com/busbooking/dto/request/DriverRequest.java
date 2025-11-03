package com.busbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverRequest {
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "License number is required")
    private String licenseNumber;
    
    private String phone;
    
    @Positive(message = "Experience years must be positive")
    private Integer experienceYears;
    
    private String imageUrl; // URL of driver's photo from Cloudinary
}
