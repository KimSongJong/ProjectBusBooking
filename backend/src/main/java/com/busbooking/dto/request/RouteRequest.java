package com.busbooking.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequest {
    
    @NotBlank(message = "Điểm đi không được để trống")
    @Size(min = 2, max = 100, message = "Điểm đi phải có từ 2-100 ký tự")
    private String fromLocation;
    
    @NotBlank(message = "Điểm đến không được để trống")
    @Size(min = 2, max = 100, message = "Điểm đến phải có từ 2-100 ký tự")
    private String toLocation;
    
    @NotNull(message = "Khoảng cách không được để trống")
    @DecimalMin(value = "1.0", message = "Khoảng cách phải ít nhất 1 km")
    @DecimalMax(value = "5000.0", message = "Khoảng cách không được quá 5000 km")
    private BigDecimal distanceKm;
    
    @NotNull(message = "Giá vé không được để trống")
    @DecimalMin(value = "10000.0", message = "Giá vé phải ít nhất 10,000 VND")
    @DecimalMax(value = "10000000.0", message = "Giá vé không được quá 10,000,000 VND")
    private BigDecimal basePrice;
    
    @NotNull(message = "Thời gian ước tính không được để trống")
    @Min(value = 30, message = "Thời gian ước tính phải ít nhất 30 phút")
    @Max(value = 4320, message = "Thời gian ước tính không được quá 4320 phút (3 ngày)")
    private Integer estimatedDuration; // in minutes
}
