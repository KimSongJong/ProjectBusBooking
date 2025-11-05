package com.busbooking.service;

import com.busbooking.model.Trip;
import com.busbooking.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service tự động cập nhật trạng thái chuyến xe
 * - scheduled -> ongoing: Khi đến giờ khởi hành
 * - ongoing -> completed: Khi đến giờ dự kiến đến
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TripStatusScheduler {
    
    private final TripRepository tripRepository;
    
    /**
     * Chạy mỗi phút để kiểm tra và cập nhật trạng thái
     */
    @Scheduled(fixedRate = 60000) // 60 seconds = 1 minute
    @Transactional
    public void updateTripStatuses() {
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Cập nhật scheduled -> ongoing
        List<Trip> scheduledTrips = tripRepository.findByStatus(Trip.Status.scheduled);
        for (Trip trip : scheduledTrips) {
            if (trip.getDepartureTime() != null && 
                !trip.getDepartureTime().isAfter(now)) {
                trip.setStatus(Trip.Status.ongoing);
                tripRepository.save(trip);
                log.info("Trip {} changed from scheduled to ongoing", trip.getId());
            }
        }
        
        // 2. Cập nhật ongoing -> completed
        List<Trip> ongoingTrips = tripRepository.findByStatus(Trip.Status.ongoing);
        for (Trip trip : ongoingTrips) {
            if (trip.getArrivalTime() != null && 
                !trip.getArrivalTime().isAfter(now)) {
                trip.setStatus(Trip.Status.completed);
                tripRepository.save(trip);
                log.info("Trip {} changed from ongoing to completed", trip.getId());
            }
        }
    }
}
