package com.busbooking.service;

import com.busbooking.dto.request.DriverRequest;
import com.busbooking.dto.response.DriverResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.DriverMapper;
import com.busbooking.model.Driver;
import com.busbooking.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {
    private final DriverRepository driverRepository;
    private final DriverMapper driverMapper;

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }

    public DriverResponse getDriverById(Integer id) {
        Driver d = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
        return driverMapper.toResponse(d);
    }

    public DriverResponse createDriver(DriverRequest request) {
        Driver d = driverMapper.toEntity(request);
        Driver saved = driverRepository.save(d);
        return driverMapper.toResponse(saved);
    }

    public DriverResponse updateDriver(Integer id, DriverRequest request) {
        Driver d = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
        driverMapper.updateEntity(d, request);
        Driver updated = driverRepository.save(d);
        return driverMapper.toResponse(updated);
    }

    public void deleteDriver(Integer id) {
        Driver d = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
        driverRepository.delete(d);
    }
}
