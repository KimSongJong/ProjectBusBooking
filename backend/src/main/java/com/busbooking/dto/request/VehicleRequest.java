package com.busbooking.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {
    
    @NotBlank(message = "Biển số xe không được để trống")
    @Size(min = 7, max = 15, message = "Biển số xe phải có từ 7-15 ký tự")
    @Pattern(regexp = "^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}(\\.[0-9]{2})?$", 
             message = "Biển số xe phải theo định dạng Việt Nam (VD: 51A-12345, 30H-99999)")
    private String licensePlate;
    
    @Size(max = 100, message = "Tên model không được quá 100 ký tự")
    private String model;
    
    @NotNull(message = "Số ghế không được để trống")
    @Min(value = 10, message = "Số ghế phải ít nhất 10")
    @Max(value = 50, message = "Số ghế không được quá 50")
    private Integer totalSeats;
    
    private String seatsLayout; // JSON string
    
    @NotBlank(message = "Loại xe không được để trống")
    @Pattern(regexp = "^(standard|vip|sleeper)$", 
             message = "Loại xe phải là 'standard', 'vip' hoặc 'sleeper'")
    private String vehicleType; // standard, vip, sleeper
}
