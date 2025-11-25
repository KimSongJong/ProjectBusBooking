package com.busbooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationRequest {

    @NotBlank(message = "Tên trạm xe là bắt buộc")
    private String name;

    @NotBlank(message = "Thành phố là bắt buộc")
    private String city;

    @NotBlank(message = "Địa chỉ là bắt buộc")
    private String address;

    @NotNull(message = "Vĩ độ là bắt buộc")
    private BigDecimal latitude;

    @NotNull(message = "Kinh độ là bắt buộc")
    private BigDecimal longitude;

    private String phone;

    private String stationType; // departure, arrival, both

    private Boolean isActive;
}

