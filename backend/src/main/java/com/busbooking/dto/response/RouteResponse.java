package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    // Pickup and dropoff points as List of PickupPoint objects
    private List<PickupPoint> pickupPoints;
    private List<PickupPoint> dropoffPoints;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PickupPoint {
        private String name;
        private String address;
    }
}
