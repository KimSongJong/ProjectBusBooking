package com.busbooking.mapper;

import com.busbooking.dto.StationRequest;
import com.busbooking.dto.StationResponse;
import com.busbooking.model.Station;
import org.springframework.stereotype.Component;

@Component
public class StationMapper {

    public Station toEntity(StationRequest request) {
        Station station = new Station();
        station.setName(request.getName());
        station.setCity(request.getCity());
        station.setAddress(request.getAddress());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setPhone(request.getPhone());

        // Parse station type
        if (request.getStationType() != null) {
            try {
                station.setStationType(Station.StationType.valueOf(request.getStationType().toLowerCase()));
            } catch (IllegalArgumentException e) {
                station.setStationType(Station.StationType.both);
            }
        } else {
            station.setStationType(Station.StationType.both);
        }

        station.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return station;
    }

    public StationResponse toResponse(Station station) {
        if (station == null) {
            throw new IllegalArgumentException("Station cannot be null");
        }

        try {
            return StationResponse.builder()
                    .id(station.getId())
                    .name(station.getName() != null ? station.getName() : "Unknown")
                    .city(station.getCity() != null ? station.getCity() : "Unknown")
                    .address(station.getAddress() != null ? station.getAddress() : "")
                    .latitude(station.getLatitude())
                    .longitude(station.getLongitude())
                    .phone(station.getPhone())
                    .stationType(station.getStationType() != null ? station.getStationType().name() : "both")
                    .isActive(station.getIsActive() != null ? station.getIsActive() : true)
                    .createdAt(station.getCreatedAt())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error mapping station ID " + station.getId() + ": " + e.getMessage(), e);
        }
    }

    public void updateEntity(Station station, StationRequest request) {
        station.setName(request.getName());
        station.setCity(request.getCity());
        station.setAddress(request.getAddress());
        station.setLatitude(request.getLatitude());
        station.setLongitude(request.getLongitude());
        station.setPhone(request.getPhone());

        if (request.getStationType() != null && !request.getStationType().trim().isEmpty()) {
            String typeValue = request.getStationType().trim();
            try {
                // Try exact match first
                station.setStationType(Station.StationType.valueOf(typeValue));
            } catch (IllegalArgumentException e) {
                // Try case-insensitive match
                try {
                    station.setStationType(Station.StationType.valueOf(typeValue.toLowerCase()));
                } catch (IllegalArgumentException e2) {
                    // Keep existing type if invalid
                }
            }
        }

        if (request.getIsActive() != null) {
            station.setIsActive(request.getIsActive());
        }
    }
}

