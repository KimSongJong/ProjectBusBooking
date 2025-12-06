package com.busbooking.controller;

import com.busbooking.dto.request.PromotionRequest;
import com.busbooking.dto.request.ValidatePromotionRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.PromotionResponse;
import com.busbooking.dto.response.PromotionValidationResponse;
import com.busbooking.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionController {
    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Promotions retrieved", promotionService.getAllPromotions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Promotion retrieved", promotionService.getPromotionById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionResponse>> create(@Valid @RequestBody PromotionRequest request) {
        PromotionResponse resp = promotionService.createPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Promotion created", resp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> update(@PathVariable Integer id, @Valid @RequestBody PromotionRequest request) {
        PromotionResponse resp = promotionService.updatePromotion(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Promotion updated", resp));
    }

    /**
     * Get all active promotions that are currently valid
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getActivePromotions() {
        List<PromotionResponse> activePromotions = promotionService.getActivePromotions();
        return ResponseEntity.ok(new ApiResponse<>(true, "Active promotions retrieved", activePromotions));
    }

    /**
     * Validate promotion code and calculate discount
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<PromotionValidationResponse>> validatePromotion(@Valid @RequestBody ValidatePromotionRequest request) {
        PromotionValidationResponse validation = promotionService.validatePromotion(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Promotion validated", validation));
    }

    /**
     * Delete promotion
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Promotion deleted successfully", null));
    }
}
