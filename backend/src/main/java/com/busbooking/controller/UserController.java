package com.busbooking.controller;

import com.busbooking.dto.request.UpdateUserRequest;
import com.busbooking.dto.request.UserRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.UserResponse;
import com.busbooking.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Users retrieved", userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "User retrieved", userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        // Encode password before creating user
        request.setPassword(passwordEncoder.encode(request.getPassword()));
        UserResponse resp = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "User created", resp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Integer id, @Valid @RequestBody UpdateUserRequest request) {
        // Only encode password if it's provided (not null or empty)
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            request.setPassword(passwordEncoder.encode(request.getPassword()));
        } else {
            // Set password to null so service knows to keep existing password
            request.setPassword(null);
        }
        UserResponse resp = userService.updateUser(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "User updated", resp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deleted", null));
    }
}
