package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponse {
    private Integer id;
    private String fromLocation;
    private String toLocation;
    private BigDecimal distanceKm;
    private BigDecimal basePrice;
    private Integer estimatedDuration;
    private LocalDateTime createdAt;
}
