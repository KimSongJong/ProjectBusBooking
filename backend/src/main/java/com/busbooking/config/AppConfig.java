package com.busbooking.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Application Configuration
 * Provides common beans used throughout the application
 */
@Configuration
public class AppConfig {

    /**
     * RestTemplate bean for making HTTP requests
     * Used by payment services (MoMo, VNPay, etc.)
     * This bean is injected via Spring dependency injection
     */
    @Bean
    @SuppressWarnings("unused")
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * ObjectMapper bean for JSON serialization/deserialization
     * Used by RouteMapper to parse JSON pickup_points and dropoff_points
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Register JavaTimeModule for LocalDateTime support
        mapper.registerModule(new JavaTimeModule());
        // Disable writing dates as timestamps
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}

