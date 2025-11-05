package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleRouteResponse {
    private Integer routeId;
    private String fromLocation;
    private String toLocation;
    private BigDecimal distanceKm;
    private BigDecimal basePrice;
    private Integer estimatedDuration;
    private Set<String> vehicleTypes; // Danh sách loại xe đã lên lịch cho tuyến này
    private Integer tripCount; // Số lượng chuyến đã lên lịch
}
