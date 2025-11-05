package com.busbooking.dto.request;

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
public class DriverRequest {
    
    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 50, message = "Họ và tên phải có từ 2-50 ký tự")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Họ và tên chỉ được chứa chữ cái và khoảng trắng")
    private String fullName;
    
    @NotBlank(message = "Số bằng lái không được để trống")
    @Size(min = 5, max = 20, message = "Số bằng lái phải có từ 5-20 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9\\-]+$", message = "Số bằng lái chỉ được chứa chữ cái, số và dấu gạch ngang (-)")
    private String licenseNumber;
    
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại phải có 10 chữ số bắt đầu bằng số 0 (VD: 0912345678)")
    private String phone;
    
    @NotNull(message = "Số năm kinh nghiệm không được để trống")
    @Min(value = 0, message = "Số năm kinh nghiệm phải lớn hơn hoặc bằng 0")
    private Integer experienceYears;
    
    private String imageUrl; // URL of driver's photo from Cloudinary
}
