package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {
    private Integer routeId;
    private String fromLocation;
    private String toLocation;
    private BigDecimal distanceKm;
    private BigDecimal basePrice;
    private Integer estimatedDuration;
    private Set<String> vehicleTypes; // Các loại xe phục vụ tuyến này
    private Integer tripCount; // Số chuyến xe
}
