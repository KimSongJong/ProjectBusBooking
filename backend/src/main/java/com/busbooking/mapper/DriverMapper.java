package com.busbooking.mapper;

import com.busbooking.dto.request.DriverRequest;
import com.busbooking.dto.response.DriverResponse;
import com.busbooking.model.Driver;
import org.springframework.stereotype.Component;

@Component
public class DriverMapper {

    public Driver toEntity(DriverRequest request) {
        Driver d = new Driver();
        d.setFullName(request.getFullName());
        d.setLicenseNumber(request.getLicenseNumber());
        d.setPhone(request.getPhone());
        d.setExperienceYears(request.getExperienceYears());
        d.setImageUrl(request.getImageUrl());
        return d;
    }

    public DriverResponse toResponse(Driver d) {
        return new DriverResponse(
                d.getId(),
                d.getFullName(),
                d.getPhone(),
                d.getLicenseNumber(),
                d.getExperienceYears(),
                d.getImageUrl(),
                d.getCreatedAt()
        );
    }

    public void updateEntity(Driver d, DriverRequest request) {
        d.setFullName(request.getFullName());
        d.setLicenseNumber(request.getLicenseNumber());
        d.setPhone(request.getPhone());
        d.setExperienceYears(request.getExperienceYears());
        if (request.getImageUrl() != null) {
            d.setImageUrl(request.getImageUrl());
        }
    }
}
