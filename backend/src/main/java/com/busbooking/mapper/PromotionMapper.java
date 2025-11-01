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
        p.setDiscountPercentage(request.getDiscountPercentage());
        p.setDiscountAmount(request.getDiscountAmount());
        p.setStartDate(request.getStartDate());
        p.setEndDate(request.getEndDate());
        p.setMaxUses(request.getMaxUses());
        return p;
    }

    public PromotionResponse toResponse(Promotion p) {
        return new PromotionResponse(
                p.getId(),
                p.getCode(),
                p.getDiscountPercentage(),
                p.getDiscountAmount(),
                p.getStartDate(),
                p.getEndDate(),
                p.getMaxUses(),
                p.getUsedCount(),
                p.getCreatedAt()
        );
    }

    public void updateEntity(Promotion p, PromotionRequest request) {
        p.setCode(request.getCode());
        p.setDiscountPercentage(request.getDiscountPercentage());
        p.setDiscountAmount(request.getDiscountAmount());
        p.setStartDate(request.getStartDate());
        p.setEndDate(request.getEndDate());
        p.setMaxUses(request.getMaxUses());
    }
}
