package com.busbooking.service;

import com.busbooking.dto.StationRequest;
import com.busbooking.dto.StationResponse;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.mapper.StationMapper;
import com.busbooking.model.Station;
import com.busbooking.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StationService {

    private final StationRepository stationRepository;
    private final StationMapper stationMapper;

    public List<StationResponse> getAllStations() {
        log.info("📍 Getting all stations");
        return stationRepository.findAll().stream()
                .map(stationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<StationResponse> getActiveStations() {
        log.info("📍 Getting active stations");
        try {
            List<Station> stations = stationRepository.findByIsActiveTrue();
            log.info("📍 Found {} active stations in database", stations.size());

            List<StationResponse> responses = stations.stream()
                    .map(station -> {
                        try {
                            return stationMapper.toResponse(station);
                        } catch (Exception e) {
                            log.error("❌ Error mapping station ID {}: {}", station.getId(), e.getMessage(), e);
                            return null;
                        }
                    })
                    .filter(response -> response != null)
                    .collect(Collectors.toList());

            log.info("✅ Successfully mapped {} active stations", responses.size());
            return responses;
        } catch (Exception e) {
            log.error("❌ Error fetching active stations from database", e);
            throw new RuntimeException("Error fetching active stations: " + e.getMessage(), e);
        }
    }

    public List<StationResponse> getStationsByCity(String city) {
        log.info("📍 Getting stations for city: {}", city);
        return stationRepository.findByCity(city).stream()
                .map(stationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<StationResponse> getActiveStationsByCity(String city) {
        log.info("📍 Getting active stations for city: {}", city);
        return stationRepository.findByCityAndIsActiveTrue(city).stream()
                .map(stationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<StationResponse> searchActiveStations(String keyword) {
        log.info("🔍 Searching active stations with keyword: {}", keyword);
        return stationRepository.searchStations(keyword).stream()
                .filter(station -> station.getIsActive() != null && station.getIsActive())
                .map(stationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public StationResponse getStationById(Integer id) {
        log.info("📍 Getting station by ID: {}", id);
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạm xe với ID: " + id));
        return stationMapper.toResponse(station);
    }

    public List<StationResponse> searchStations(String keyword) {
        log.info("🔍 Searching stations with keyword: {}", keyword);
        return stationRepository.searchStations(keyword).stream()
                .map(stationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<String> getAllActiveCities() {
        log.info("🏙️ Getting all active cities");
        return stationRepository.findAllActiveCities();
    }

    @Transactional
    public StationResponse createStation(StationRequest request) {
        log.info("✅ Creating new station: {}", request.getName());

        Station station = stationMapper.toEntity(request);
        Station savedStation = stationRepository.save(station);

        log.info("✅ Station created with ID: {}", savedStation.getId());
        return stationMapper.toResponse(savedStation);
    }

    @Transactional
    public StationResponse updateStation(Integer id, StationRequest request) {
        log.info("🔄 Updating station ID: {}", id);

        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạm xe với ID: " + id));

        stationMapper.updateEntity(station, request);
        Station updatedStation = stationRepository.save(station);

        log.info("✅ Station updated: {}", updatedStation.getName());
        return stationMapper.toResponse(updatedStation);
    }

    @Transactional
    public void deleteStation(Integer id) {
        log.info("🗑️ Soft deleting station ID: {}", id);

        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạm xe với ID: " + id));

        station.setIsActive(false);
        stationRepository.save(station);

        log.info("✅ Station marked as inactive: {}", station.getName());
    }

    @Transactional
    public void hardDeleteStation(Integer id) {
        log.info("⚠️ Hard deleting station ID: {}", id);

        if (!stationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy trạm xe với ID: " + id);
        }

        stationRepository.deleteById(id);
        log.info("✅ Station permanently deleted");
    }

    public List<StationResponse> getStationsByType(String stationType) {
        log.info("📍 Getting stations by type: {}", stationType);
        return stationRepository.findByStationType(Station.StationType.valueOf(stationType)).stream()
                .map(stationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StationResponse toggleStationStatus(Integer id) {
        log.info("🔄 Toggling station status for ID: {}", id);

        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạm xe với ID: " + id));

        station.setIsActive(!station.getIsActive());
        Station updatedStation = stationRepository.save(station);

        log.info("✅ Station status toggled: {} is now {}",
                updatedStation.getName(),
                updatedStation.getIsActive() ? "active" : "inactive");

        return stationMapper.toResponse(updatedStation);
    }
}

