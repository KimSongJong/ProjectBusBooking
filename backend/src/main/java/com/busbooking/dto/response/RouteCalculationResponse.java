package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteCalculationResponse {
    private Integer fromStationId;
    private String fromStationName;
    private String fromCity;

    private Integer toStationId;
    private String toStationName;
    private String toCity;

    private BigDecimal distanceKm;
    private Integer durationMinutes;
    private BigDecimal basePrice;

    private String calculationSource; // "google_maps" or "haversine_fallback"
    private String message;
}

