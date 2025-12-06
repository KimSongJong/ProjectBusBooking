package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CityResponse {
    private Integer id;
    private String name;
    private String normalizedName;
    private String region;
    private Boolean isPopular;
    private Boolean isActive;
    private Double latitude;
    private Double longitude;
}

