package com.busbooking.controller;

import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.TripSeatResponse;
import com.busbooking.service.TripSeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trip-seats")
@RequiredArgsConstructor
public class TripSeatController {
    
    private final TripSeatService tripSeatService;
    
    /**
     * Lấy tất cả ghế của một chuyến xe
     */
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<ApiResponse<List<TripSeatResponse>>> getSeatsByTrip(@PathVariable Integer tripId) {
        List<TripSeatResponse> seats = tripSeatService.getSeatsByTripId(tripId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Seats retrieved successfully", seats));
    }
    
    /**
     * Lấy danh sách ghế trống
     */
    @GetMapping("/trip/{tripId}/available")
    public ResponseEntity<ApiResponse<List<TripSeatResponse>>> getAvailableSeats(@PathVariable Integer tripId) {
        List<TripSeatResponse> seats = tripSeatService.getAvailableSeats(tripId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Available seats retrieved successfully", seats));
    }
    
    /**
     * Đếm số ghế trống
     */
    @GetMapping("/trip/{tripId}/available-count")
    public ResponseEntity<ApiResponse<Long>> countAvailableSeats(@PathVariable Integer tripId) {
        Long count = tripSeatService.countAvailableSeats(tripId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Available seats counted", count));
    }
    
    /**
     * Tạo ghế cho trip (sử dụng khi tạo trip mới)
     */
    @PostMapping("/trip/{tripId}/create")
    public ResponseEntity<ApiResponse<Void>> createSeatsForTrip(@PathVariable Integer tripId) {
        tripSeatService.createSeatsForTrip(tripId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Seats created for trip", null));
    }
    
    /**
     * Đặt ghế
     */
    @PatchMapping("/{tripSeatId}/book")
    public ResponseEntity<ApiResponse<TripSeatResponse>> bookSeat(@PathVariable Integer tripSeatId) {
        TripSeatResponse seat = tripSeatService.bookSeat(tripSeatId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ghế đã được đặt thành công", seat));
    }
    
    /**
     * Hủy đặt ghế
     */
    @PatchMapping("/{tripSeatId}/cancel")
    public ResponseEntity<ApiResponse<TripSeatResponse>> cancelSeat(@PathVariable Integer tripSeatId) {
        TripSeatResponse seat = tripSeatService.cancelSeat(tripSeatId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã hủy đặt ghế", seat));
    }
    
    /**
     * Khóa ghế
     */
    @PatchMapping("/{tripSeatId}/lock")
    public ResponseEntity<ApiResponse<TripSeatResponse>> lockSeat(@PathVariable Integer tripSeatId) {
        TripSeatResponse seat = tripSeatService.lockSeat(tripSeatId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ghế đã được khóa", seat));
    }
}
