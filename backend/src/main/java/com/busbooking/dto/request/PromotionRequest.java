package com.busbooking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionRequest {
    
    @NotBlank(message = "Promotion code is required")
    private String code;
    
    private BigDecimal discountPercentage;
    
    private BigDecimal discountAmount;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @Positive(message = "Max uses must be positive")
    private Integer maxUses;
}
