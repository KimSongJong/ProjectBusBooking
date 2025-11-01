package com.busbooking.controller;

import com.busbooking.dto.request.SeatRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.SeatResponse;
import com.busbooking.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
public class SeatController {
    private final SeatService seatService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Seats retrieved", seatService.getAllSeats()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Seat retrieved", seatService.getSeatById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SeatResponse>> create(@Valid @RequestBody SeatRequest request) {
        SeatResponse resp = seatService.createSeat(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Seat created", resp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatResponse>> update(@PathVariable Integer id, @Valid @RequestBody SeatRequest request) {
        SeatResponse resp = seatService.updateSeat(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Seat updated", resp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        seatService.deleteSeat(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Seat deleted", null));
    }
}
