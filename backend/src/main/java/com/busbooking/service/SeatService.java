package com.busbooking.service;

import com.busbooking.dto.request.SeatRequest;
import com.busbooking.dto.response.SeatResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.SeatMapper;
import com.busbooking.model.Seat;
import com.busbooking.model.Vehicle;
import com.busbooking.repository.SeatRepository;
import com.busbooking.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatService {
    private final SeatRepository seatRepository;
    private final VehicleRepository vehicleRepository;
    private final SeatMapper seatMapper;

    public List<SeatResponse> getAllSeats() {
        return seatRepository.findAll().stream()
                .map(seatMapper::toResponse)
                .collect(Collectors.toList());
    }

    public SeatResponse getSeatById(Integer id) {
        Seat s = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + id));
        return seatMapper.toResponse(s);
    }

    public SeatResponse createSeat(SeatRequest request) {
        Vehicle v = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));
        Seat s = seatMapper.toEntity(request);
        s.setVehicle(v);
        Seat saved = seatRepository.save(s);
        return seatMapper.toResponse(saved);
    }

    public SeatResponse updateSeat(Integer id, SeatRequest request) {
        Seat s = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + id));
        Vehicle v = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));
        seatMapper.updateEntity(s, request);
        s.setVehicle(v);
        Seat updated = seatRepository.save(s);
        return seatMapper.toResponse(updated);
    }

    public void deleteSeat(Integer id) {
        Seat s = seatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + id));
        seatRepository.delete(s);
    }
}
