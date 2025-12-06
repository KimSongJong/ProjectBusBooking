package com.busbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CityRequest {

    @NotBlank(message = "Tên thành phố không được để trống")
    private String name;

    @NotNull(message = "Vùng không được để trống")
    private String region; // "north", "central", "south"

    private Boolean isPopular = false;

    private Double latitude;

    private Double longitude;
}

