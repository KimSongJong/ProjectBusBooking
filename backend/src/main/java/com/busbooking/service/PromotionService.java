package com.busbooking.service;

import com.busbooking.dto.request.PromotionRequest;
import com.busbooking.dto.request.ValidatePromotionRequest;
import com.busbooking.dto.response.PromotionResponse;
import com.busbooking.dto.response.PromotionValidationResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.PromotionMapper;
import com.busbooking.model.Promotion;
import com.busbooking.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {
    private final PromotionRepository promotionRepository;
    private final PromotionMapper promotionMapper;

    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public PromotionResponse getPromotionById(Integer id) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        return promotionMapper.toResponse(p);
    }

    public PromotionResponse createPromotion(PromotionRequest request) {
        Promotion p = promotionMapper.toEntity(request);
        Promotion saved = promotionRepository.save(p);
        return promotionMapper.toResponse(saved);
    }

    public PromotionResponse updatePromotion(Integer id, PromotionRequest request) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        promotionMapper.updateEntity(p, request);
        Promotion updated = promotionRepository.save(p);
        return promotionMapper.toResponse(updated);
    }

    public void deletePromotion(Integer id) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));
        promotionRepository.delete(p);
    }

    /**
     * Get all active promotions that are currently valid
     */
    public List<PromotionResponse> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findAll().stream()
                .filter(p -> p.getIsActive() != null && p.getIsActive())
                .filter(p -> p.getStartDate() != null && p.getStartDate().isBefore(now))
                .filter(p -> p.getEndDate() != null && p.getEndDate().isAfter(now))
                .filter(p -> p.getUsageLimit() == null || p.getUsedCount() == null || p.getUsedCount() < p.getUsageLimit())
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Validate promotion code and calculate discount
     */
    public PromotionValidationResponse validatePromotion(ValidatePromotionRequest request) {
        // Find promotion by code
        Promotion promotion = promotionRepository.findByCode(request.getCode())
                .orElse(null);

        if (promotion == null) {
            return new PromotionValidationResponse(
                false,
                "Mã giảm giá không tồn tại",
                BigDecimal.ZERO,
                request.getTotalAmount(),
                null
            );
        }

        // Check if promotion is active
        if (promotion.getIsActive() == null || !promotion.getIsActive()) {
            return new PromotionValidationResponse(
                false,
                "Mã giảm giá đã bị vô hiệu hóa",
                BigDecimal.ZERO,
                request.getTotalAmount(),
                null
            );
        }

        // Check date validity
        LocalDateTime now = LocalDateTime.now();
        if (promotion.getStartDate() != null && promotion.getStartDate().isAfter(now)) {
            return new PromotionValidationResponse(
                false,
                "Mã giảm giá chưa có hiệu lực",
                BigDecimal.ZERO,
                request.getTotalAmount(),
                null
            );
        }

        if (promotion.getEndDate() != null && promotion.getEndDate().isBefore(now)) {
            return new PromotionValidationResponse(
                false,
                "Mã giảm giá đã hết hạn",
                BigDecimal.ZERO,
                request.getTotalAmount(),
                null
            );
        }

        // Check usage limit
        if (promotion.getUsageLimit() != null && promotion.getUsedCount() != null) {
            if (promotion.getUsedCount() >= promotion.getUsageLimit()) {
                return new PromotionValidationResponse(
                    false,
                    "Mã giảm giá đã hết lượt sử dụng",
                    BigDecimal.ZERO,
                    request.getTotalAmount(),
                    null
                );
            }
        }

        // Check minimum amount
        if (promotion.getMinAmount() != null && request.getTotalAmount().compareTo(promotion.getMinAmount()) < 0) {
            return new PromotionValidationResponse(
                false,
                "Đơn hàng chưa đạt giá trị tối thiểu " + promotion.getMinAmount() + " VND",
                BigDecimal.ZERO,
                request.getTotalAmount(),
                null
            );
        }

        // Check round trip eligibility
        if (request.getIsRoundTrip() != null && request.getIsRoundTrip()) {
            // This is a round trip booking - check if promotion allows it
            if (promotion.getApplicableToRoundTrip() == null || !promotion.getApplicableToRoundTrip()) {
                return new PromotionValidationResponse(
                    false,
                    "Mã giảm giá không áp dụng cho vé khứ hồi",
                    BigDecimal.ZERO,
                    request.getTotalAmount(),
                    null
                );
            }
        } else {
            // ⭐ FIX: This is ONE-WAY booking - check if promotion is ONLY for round trip
            if (promotion.getApplicableToRoundTrip() != null && promotion.getApplicableToRoundTrip()) {
                return new PromotionValidationResponse(
                    false,
                    "Mã giảm giá chỉ áp dụng cho vé khứ hồi",
                    BigDecimal.ZERO,
                    request.getTotalAmount(),
                    null
                );
            }
        }

        // Calculate discount
        BigDecimal discountAmount;
        if (promotion.getDiscountType() == Promotion.DiscountType.percentage) {
            // Percentage discount
            discountAmount = request.getTotalAmount()
                    .multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Apply max discount if set
            if (promotion.getMaxDiscount() != null && discountAmount.compareTo(promotion.getMaxDiscount()) > 0) {
                discountAmount = promotion.getMaxDiscount();
            }
        } else {
            // Fixed discount
            discountAmount = promotion.getDiscountValue();
        }

        // Ensure discount doesn't exceed total amount
        if (discountAmount.compareTo(request.getTotalAmount()) > 0) {
            discountAmount = request.getTotalAmount();
        }

        BigDecimal finalPrice = request.getTotalAmount().subtract(discountAmount);

        return new PromotionValidationResponse(
            true,
            "Áp dụng mã giảm giá thành công",
            discountAmount,
            finalPrice,
            promotionMapper.toResponse(promotion)
        );
    }

    /**
     * Increment usage count when promotion is applied
     */
    public void incrementUsageCount(String code) {
        Promotion promotion = promotionRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with code: " + code));

        if (promotion.getUsedCount() == null) {
            promotion.setUsedCount(1);
        } else {
            promotion.setUsedCount(promotion.getUsedCount() + 1);
        }

        promotionRepository.save(promotion);
    }
}
