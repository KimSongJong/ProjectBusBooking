package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Integer userId;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String phone; // THÊM FIELD NÀY

    public LoginResponse(String token, Integer userId, String username, String email, String role, String fullName,
            String phone) {
        this.token = token;
        this.type = "Bearer";
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.fullName = fullName;
        this.phone = phone;
    }
}
