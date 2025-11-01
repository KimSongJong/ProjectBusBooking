package com.busbooking.service;

import com.busbooking.dto.request.PromotionRequest;
import com.busbooking.dto.response.PromotionResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.PromotionMapper;
import com.busbooking.model.Promotion;
import com.busbooking.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
