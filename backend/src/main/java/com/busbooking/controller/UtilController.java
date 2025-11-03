package com.busbooking.controller;

import com.busbooking.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/util")
@RequiredArgsConstructor
public class UtilController {
    
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Generate BCrypt hash for a plain text password
     * ONLY for development/testing purposes
     * Should be DISABLED in production
     */
    @PostMapping("/encode-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> encodePassword(@RequestParam String password) {
        String encodedPassword = passwordEncoder.encode(password);
        
        Map<String, String> result = new HashMap<>();
        result.put("plainText", password);
        result.put("bcryptHash", encodedPassword);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Password encoded", result));
    }
    
    /**
     * Verify if a plain text password matches a BCrypt hash
     * ONLY for development/testing purposes
     */
    @PostMapping("/verify-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPassword(
            @RequestParam String plainText,
            @RequestParam String hash) {
        
        boolean matches = passwordEncoder.matches(plainText, hash);
        
        Map<String, Object> result = new HashMap<>();
        result.put("plainText", plainText);
        result.put("hash", hash);
        result.put("matches", matches);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Password verified", result));
    }
}
