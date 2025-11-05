package com.busbooking.service;

import com.busbooking.dto.request.VehicleRequest;
import com.busbooking.dto.response.VehicleResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.VehicleMapper;
import com.busbooking.model.Vehicle;
import com.busbooking.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;

    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(vehicleMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<VehicleResponse> getActiveVehicles() {
        return vehicleRepository.findByIsActiveTrue().stream()
                .map(vehicleMapper::toResponse)
                .collect(Collectors.toList());
    }

    public VehicleResponse getVehicleById(Integer id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return vehicleMapper.toResponse(v);
    }

    public VehicleResponse createVehicle(VehicleRequest request) {
        Vehicle v = vehicleMapper.toEntity(request);
        Vehicle saved = vehicleRepository.save(v);
        return vehicleMapper.toResponse(saved);
    }

    public VehicleResponse updateVehicle(Integer id, VehicleRequest request) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        
        // Chỉ cho phép cập nhật biển số xe và sơ đồ ghế
        v.setLicensePlate(request.getLicensePlate());
        v.setSeatsLayout(request.getSeatsLayout());
        
        Vehicle updated = vehicleRepository.save(v);
        return vehicleMapper.toResponse(updated);
    }
    
    public VehicleResponse toggleVehicleStatus(Integer id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xe với id: " + id));
        
        v.setIsActive(!v.getIsActive());
        Vehicle updated = vehicleRepository.save(v);
        return vehicleMapper.toResponse(updated);
    }

    public void deleteVehicle(Integer id) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        vehicleRepository.delete(v);
    }
}
