package com.busbooking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải có từ 3-50 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới")
    private String username;
    
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải có từ 6-100 ký tự")
    private String password;
    
    @Email(message = "Email không đúng định dạng")
    @NotBlank(message = "Email không được để trống")
    private String email;
    
    @NotBlank(message = "Vai trò không được để trống")
    @Pattern(regexp = "^(customer|staff|admin)$", message = "Vai trò phải là customer, staff hoặc admin")
    private String role; // customer, staff, admin
    
    @Size(min = 2, max = 50, message = "Họ và tên phải có từ 2-50 ký tự")
    private String fullName;
    
    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại phải có 10 chữ số bắt đầu bằng số 0 (VD: 0912345678)")
    private String phone;
}
