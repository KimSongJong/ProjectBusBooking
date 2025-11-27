package com.busbooking.controller;

import com.busbooking.dto.request.LoginRequest;
import com.busbooking.dto.request.ResendOtpRequest;
import com.busbooking.dto.request.UserRequest;
import com.busbooking.dto.request.VerifyOtpRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.LoginResponse;
import com.busbooking.dto.response.UserResponse;
import com.busbooking.model.User;
import com.busbooking.repository.UserRepository;
import com.busbooking.security.JwtTokenProvider;
import com.busbooking.service.EmailService;
import com.busbooking.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final UserService userService;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider tokenProvider;
        private final EmailService emailService;

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
                // Authenticate user
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Generate JWT token
                String token = tokenProvider.generateToken(authentication);

                // Get user details
                User user = userRepository.findByUsername(loginRequest.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                LoginResponse loginResponse = new LoginResponse(
                                token,
                                user.getId(),
                                user.getUsername(),
                                user.getEmail(),
                                user.getRole().name(),
                                user.getFullName(),
                                user.getPhone());

                return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", loginResponse));
        }

        @PostMapping("/register")
        public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UserRequest userRequest) {
                // Check if username exists
                if (userRepository.existsByUsername(userRequest.getUsername())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse<>(false, "Username already exists", null));
                }

                // Check if email exists
                if (userRepository.existsByEmail(userRequest.getEmail())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(new ApiResponse<>(false, "Email already exists", null));
                }

                // Encode password before saving
                String encodedPassword = passwordEncoder.encode(userRequest.getPassword());
                userRequest.setPassword(encodedPassword);

                // Create user (will be INACTIVE until OTP verification)
                UserResponse userResponse = userService.createUser(userRequest);

                // Generate 6-digit OTP
                String otpCode = generateOtp();
                LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5); // OTP valid for 5 minutes

                // Save OTP to database
                User user = userRepository.findById(userResponse.getId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                user.setOtpCode(otpCode);
                user.setOtpExpiresAt(expiresAt);
                userRepository.save(user);

                // Send OTP email
                emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otpCode, expiresAt);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new ApiResponse<>(true,
                                        "Registration successful! Please check your email for OTP verification code.",
                                        userResponse));
        }

        /**
         * Verify OTP code sent to user's email
         */
        @PostMapping("/verify-otp")
        public ResponseEntity<ApiResponse<String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
                User user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

                // Check if OTP matches
                if (!request.getOtpCode().equals(user.getOtpCode())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ApiResponse<>(false, "Invalid OTP code", null));
                }

                // Check if OTP expired
                if (user.getOtpExpiresAt() == null || LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ApiResponse<>(false, "OTP code has expired. Please request a new one.", null));
                }

                // Activate user account
                user.setIsActive(true);
                user.setEmailVerified(true);
                user.setOtpCode(null); // Clear OTP
                user.setOtpExpiresAt(null);
                userRepository.save(user);

                // Send welcome email
                emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());

                return ResponseEntity.ok(new ApiResponse<>(true,
                        "Email verified successfully! You can now login.",
                        null));
        }

        /**
         * Resend OTP if user didn't receive it or it expired
         */
        @PostMapping("/resend-otp")
        public ResponseEntity<ApiResponse<String>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
                User user = userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

                // Check if already verified
                if (Boolean.TRUE.equals(user.getEmailVerified())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ApiResponse<>(false, "Email already verified", null));
                }

                // Generate new OTP
                String otpCode = generateOtp();
                LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

                user.setOtpCode(otpCode);
                user.setOtpExpiresAt(expiresAt);
                userRepository.save(user);

                // Send new OTP email
                emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otpCode, expiresAt);

                return ResponseEntity.ok(new ApiResponse<>(true,
                        "New OTP code sent to your email",
                        null));
        }

        /**
         * Generate 6-digit OTP code
         */
        private String generateOtp() {
                Random random = new Random();
                int otp = 100000 + random.nextInt(900000); // 6-digit number
                return String.valueOf(otp);
        }

        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<Void>> logout() {
                SecurityContextHolder.clearContext();
                return ResponseEntity.ok(new ApiResponse<>(true, "Logout successful", null));
        }

        @GetMapping("/me")
        public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
                if (authentication == null || !authentication.isAuthenticated()) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(new ApiResponse<>(false, "User not authenticated", null));
                }

                String username = authentication.getName();
                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserResponse userResponse = new UserResponse(
                                user.getId(),
                                user.getUsername(),
                                user.getEmail(),
                                user.getRole().name(),
                                user.getFullName(),
                                user.getPhone(),
                                user.getIsActive(),
                                user.getCreatedAt());

                return ResponseEntity.ok(new ApiResponse<>(true, "User details retrieved", userResponse));
        }
}
