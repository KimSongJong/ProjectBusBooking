package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {
    private Integer id;
    private String fullName;
    private String phone;
    private String licenseNumber;
    private Integer experienceYears;
    private String imageUrl;
    private LocalDateTime createdAt;
}
