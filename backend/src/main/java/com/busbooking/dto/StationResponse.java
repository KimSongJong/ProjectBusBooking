package com.busbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationResponse {
    private Integer id;
    private String name;
    private String city;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String stationType;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

