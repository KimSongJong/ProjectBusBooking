package com.busbooking.config;

import com.busbooking.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            // Removed explicit CORS config - let CorsConfigurationSource bean handle it automatically
            .authorizeHttpRequests(auth -> auth
                // CORS preflight requests - must be first!
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                // ⚠️ IMPORTANT: Admin endpoints MUST be before permitAll() rules!
                // Admin endpoints - require ADMIN role (note: context-path is /api, so /admin/** maps to /api/admin/**)
                .requestMatchers("/admin/**").hasRole("ADMIN")  // All admin endpoints (maps to /api/admin/**)

                // Public endpoints - no authentication required
                .requestMatchers("/auth/**").permitAll()  // Authentication endpoints
                .requestMatchers("/test/**").permitAll()  // Test endpoints (DEVELOPMENT ONLY)
                .requestMatchers("/api/debug/**").permitAll()  // Debug endpoints (DEVELOPMENT ONLY - REMOVE IN PRODUCTION!)
                .requestMatchers("/util/**").permitAll()  // Utility endpoints (development only)
                .requestMatchers("/upload/**").permitAll()  // Image upload endpoints (for testing)
                .requestMatchers("/payment/**").permitAll()  // Payment gateway endpoints (VNPay, MoMo callbacks)
                .requestMatchers("/api/payment/**").permitAll()  // Payment callback endpoints

                // Public read-only endpoints for browsing (note: context-path is /api)
                .requestMatchers("/routes/**").permitAll()  // Browse routes (maps to /api/routes)
                .requestMatchers("/trips/**").permitAll()   // Browse trips (maps to /api/trips)
                .requestMatchers("/trip-seats/**").permitAll()  // Browse trip seats (maps to /api/trip-seats)
                .requestMatchers("/promotions/**").permitAll()  // View promotions (maps to /api/promotions)
                .requestMatchers("/stations/**").permitAll()  // Station endpoints (maps to /api/stations)
                .requestMatchers("/seats/**").permitAll()     // Seat management (maps to /api/seats)
                .requestMatchers("/vehicles/**").permitAll()  // Vehicle info (maps to /api/vehicles)

                // Ticket endpoints - TEMPORARY: Allow all for testing
                .requestMatchers("/tickets/**").permitAll()  // TEMPORARY - FOR DEVELOPMENT (maps to /api/tickets)
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/tickets/**").permitAll()  // Allow DELETE
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/tickets/**").permitAll()  // Allow PUT
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/tickets/**").permitAll()  // Allow PATCH

                // Report endpoints - require authentication (role check in @PreAuthorize)
                .requestMatchers("/reports/**").authenticated()  // Report generation (maps to /api/reports)

                // Contact/Feedback endpoints - allow public POST
                .requestMatchers("/contact/**").permitAll()  // Allow public to send feedback (maps to /api/contact)


                // Protected endpoints - require authentication
                .requestMatchers("/users/**").authenticated()     // User management
                .requestMatchers("/drivers/**").authenticated()   // Driver management

                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
