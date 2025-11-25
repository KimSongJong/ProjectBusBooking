package com.busbooking.mapper;

import com.busbooking.dto.request.PromotionRequest;
import com.busbooking.dto.response.PromotionResponse;
import com.busbooking.model.Promotion;
import org.springframework.stereotype.Component;

@Component
public class PromotionMapper {

    public Promotion toEntity(PromotionRequest request) {
        Promotion p = new Promotion();
        p.setCode(request.getCode());
        p.setDescription(request.getDescription());
        p.setDiscountType(Promotion.DiscountType.valueOf(request.getDiscountType().toLowerCase()));
        p.setDiscountValue(request.getDiscountValue());
        p.setMinAmount(request.getMinAmount());
        p.setMaxDiscount(request.getMaxDiscount());
        p.setStartDate(request.getStartDate());
        p.setEndDate(request.getEndDate());
        p.setUsageLimit(request.getUsageLimit());
        p.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        p.setApplicableToRoundTrip(request.getApplicableToRoundTrip() != null ? request.getApplicableToRoundTrip() : false);
        return p;
    }

    public PromotionResponse toResponse(Promotion p) {
        return new PromotionResponse(
                p.getId(),
                p.getCode(),
                p.getDescription(),
                p.getDiscountType().name(),
                p.getDiscountValue(),
                p.getMinAmount(),
                p.getMaxDiscount(),
                p.getStartDate(),
                p.getEndDate(),
                p.getUsageLimit(),
                p.getUsedCount(),
                p.getIsActive(),
                p.getApplicableToRoundTrip(),
                p.getCreatedAt()
        );
    }

    public void updateEntity(Promotion p, PromotionRequest request) {
        p.setCode(request.getCode());
        p.setDescription(request.getDescription());
        p.setDiscountType(Promotion.DiscountType.valueOf(request.getDiscountType().toLowerCase()));
        p.setDiscountValue(request.getDiscountValue());
        p.setMinAmount(request.getMinAmount());
        p.setMaxDiscount(request.getMaxDiscount());
        p.setStartDate(request.getStartDate());
        p.setEndDate(request.getEndDate());
        p.setUsageLimit(request.getUsageLimit());
        if (request.getIsActive() != null) {
            p.setIsActive(request.getIsActive());
        }
        if (request.getApplicableToRoundTrip() != null) {
            p.setApplicableToRoundTrip(request.getApplicableToRoundTrip());
        }
    }
}
